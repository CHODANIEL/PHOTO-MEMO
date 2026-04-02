const router = require('express').Router();
const Log = require('../models/Log');
const upload = require('../middleware/upload');
const multer = require('multer');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// (S3 클라이언트 ...)
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// --- 1. 새 라이딩 로그 생성 ---
// POST /api/logs
router.post(
    '/',
    upload.single('image'),
    async (req, res) => {
        try {
            const { text, tags, latitude, longitude, isPublic } = req.body;

            if (!req.file || !text) {
                return res.status(400).json({ message: "이미지와 텍스트는 필수입니다." });
            }

            const imageUrl = req.file.location;
            const userId = req.user.id;

            let locationData = null;
            if (latitude && longitude) {
                locationData = {
                    type: 'Point',
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                };
            }

            const newLog = new Log({
                user: userId,
                text: text,
                imageUrl: imageUrl,
                location: locationData,
                tags: tags ? tags.split(',') : [],
                isPublic: Boolean(isPublic)
            });

            const savedLog = await newLog.save();
            res.status(201).json(savedLog);

        } catch (err) {
            console.error(err);
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: err.message });
            }
            res.status(500).json({ message: "로그 작성 중 서버 오류", error: err.message });
        }
    }
);

// --- 2. 나의 모든 로그 불러오기 ---
// GET /api/logs
router.get('/', async (req, res) => {
    try {
        const logs = await Log.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('user', 'displayName email');
        res.status(200).json(logs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "로그 불러오는 중 오류", error: err.message });
    }
});

// --- 3. 특정 로그 1개 불러오기 ---
// --- ▼▼▼ [수정] 이 라우트의 로직을 변경합니다 ▼▼▼ ---
// GET /api/logs/:id
router.get('/:id', async (req, res) => {
    try {
        const log = await Log.findById(req.params.id)
            .populate('user', 'displayName email')
            .populate('comments.user', 'displayName email');

        if (!log) {
            return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        }

        // [수정된 로직]
        // 1. 로그가 '공개'(isPublic)라면? -> 누구나 볼 수 있음
        if (log.isPublic) {
            return res.status(200).json(log);
        }

        // 2. 로그가 '비공개'라면? -> 주인(owner)인지 확인
        if (log.user._id.toString() === req.user.id) {
            return res.status(200).json(log);
        }

        // 3. '비공개'인데 주인도 아니라면? -> 권한 없음
        return res.status(403).json({ message: "이 로그를 볼 권한이 없습니다." });

    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: "잘못된 로그 ID 형식입니다." });
        }
        res.status(500).json({ message: "로그 조회 중 오류", error: err.message });
    }
});
// --- ▲▲▲ [수정] ---

// --- 4. 특정 로그 수정하기 ---
// PUT /api/logs/:id
router.put('/:id', async (req, res) => {
    try {
        const logId = req.params.id;
        const { text, tags, latitude, longitude, isPublic } = req.body;
        const userId = req.user.id;

        const log = await Log.findById(logId);
        if (!log) return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        if (log.user.toString() !== userId) {
            return res.status(403).json({ message: "수정 권한이 없습니다." });
        }

        log.text = text || log.text;
        log.tags = tags ? tags.split(',') : log.tags;
        if (isPublic !== undefined) {
            log.isPublic = Boolean(isPublic);
        }
        if (latitude && longitude) {
            log.location = {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
            };
        }

        const updatedLog = await log.save();
        res.status(200).json(updatedLog);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "로그 수정 중 오류", error: err.message });
    }
});

// --- 5. 특정 로그 삭제하기 ---
// DELETE /api/logs/:id
router.delete('/:id', async (req, res) => {
    try {
        const logId = req.params.id;
        const userId = req.user.id;

        const log = await Log.findById(logId);
        if (!log) return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        if (log.user.toString() !== userId) {
            return res.status(403).json({ message: "삭제 권한이 없습니다." });
        }

        const imageUrl = new URL(log.imageUrl);
        const s3Key = imageUrl.pathname.substring(1);

        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key
        }));

        await Log.findByIdAndDelete(logId);
        res.status(200).json({ message: "로그가 삭제되었습니다.", deletedLogId: logId });
    } catch (err) {
        console.error("로그 삭제 중 에러:", err);
        res.status(500).json({ message: "로그 삭제 중 오류", error: err.message });
    }
});

// --- 6. '좋아요' 토글 API ---
// PUT /api/logs/:id/like
router.put('/:id/like', async (req, res) => {
    try {
        const log = await Log.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        }

        // [수정] 좋아요는 로그인한 사용자(req.user.id)만 할 수 있습니다.
        // (authMiddleware가 이미 체크하고 있으므로 별도 코드는 불필요)
        const userId = req.user.id;
        const likeIndex = log.likes.indexOf(userId);

        if (likeIndex > -1) {
            log.likes.splice(likeIndex, 1);
        } else {
            log.likes.push(userId);
        }
        await log.save();
        res.status(200).json({
            message: "좋아요가 업데이트되었습니다.",
            likesCount: log.likes.length,
            likes: log.likes
        });
    } catch (err) {
        console.error("좋아요 처리 중 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// --- 7. '댓글' 작성 API ---
// POST /api/logs/:id/comment
router.post('/:id/comment', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: "댓글 내용이 필요합니다." });
        }

        const log = await Log.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        }

        const newComment = {
            text: text,
            user: req.user.id
        };

        log.comments.push(newComment);
        await log.save();

        const populatedLog = await log.populate('comments.user', 'displayName email');
        const addedComment = populatedLog.comments[populatedLog.comments.length - 1];
        res.status(201).json(addedComment);

    } catch (err) {
        console.error("댓글 작성 중 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// --- 8. '댓글' 삭제 API ---
// DELETE /api/logs/:id/comment/:commentId
router.delete('/:id/comment/:commentId', async (req, res) => {
    try {
        const log = await Log.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        }

        const comment = log.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
        }

        if (comment.user.toString() !== req.user.id && log.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "댓글 삭제 권한이 없습니다." });
        }

        comment.remove();
        await log.save();

        res.status(200).json({ message: "댓글이 삭제되었습니다." });

    } catch (err) {
        console.error("댓글 삭제 중 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});


module.exports = router;
