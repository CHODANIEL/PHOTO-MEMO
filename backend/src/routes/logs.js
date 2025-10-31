// backend/routes/logs.js

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
// GET /api/logs/:id
router.get('/:id', async (req, res) => {
    try {
        const log = await Log.findById(req.params.id)
            // (댓글 추가) 댓글 작성자 정보도 함께 가져옴
            .populate('user', 'displayName email')
            .populate('comments.user', 'displayName email');
        if (!log) {
            return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        }
        if (log.user._id.toString() !== req.user.id) {
            return res.status(403).json({ message: "권한이 없습니다." });
        }
        res.status(200).json(log);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(400).json({ message: "잘못된 로그 ID 형식입니다." });
        }
        res.status(500).json({ message: "로그 조회 중 오류", error: err.message });
    }
});

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

// --- 👇👇👇 7. (신규) '댓글' 작성 API ---
// POST /api/logs/:id/comment
router.post('/:id/comment', async (req, res) => {
    try {
        // 1. 프론트에서 보낸 댓글 내용(text)을 받음
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: "댓글 내용이 필요합니다." });
        }

        const log = await Log.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        }

        // 2. 새 댓글 객체 생성 (작성자는 로그인한 유저)
        const newComment = {
            text: text,
            user: req.user.id
        };

        // 3. 로그의 comments 배열에 새 댓글 추가
        log.comments.push(newComment);
        await log.save();

        // 4. (중요) 방금 추가된 댓글의 user 정보를 populate해서 반환
        // (프론트엔드에서 댓글 작성자의 이름을 바로 표시하기 위함)
        const populatedLog = await log.populate('comments.user', 'displayName email');

        // 5. 방금 추가된 마지막 댓글을 프론트로 보냄
        const addedComment = populatedLog.comments[populatedLog.comments.length - 1];
        res.status(201).json(addedComment);

    } catch (err) {
        console.error("댓글 작성 중 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// --- 👇👇👇 8. (신규) '댓글' 삭제 API ---
// DELETE /api/logs/:id/comment/:commentId
router.delete('/:id/comment/:commentId', async (req, res) => {
    try {
        const log = await Log.findById(req.params.id);
        if (!log) {
            return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        }

        // 1. 삭제할 댓글 찾기
        const comment = log.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "댓글을 찾을 수 없습니다." });
        }

        // 2. 본인 확인 (댓글 작성자이거나, 로그 주인이어야 삭제 가능)
        if (comment.user.toString() !== req.user.id && log.user.toString() !== req.user.id) {
            return res.status(403).json({ message: "댓글 삭제 권한이 없습니다." });
        }

        // 3. 배열에서 댓글 제거
        comment.remove(); // (Mongoose 7.x+)
        // (구버전 Mongoose) log.comments.pull(comment._id);

        await log.save();

        res.status(200).json({ message: "댓글이 삭제되었습니다." });

    } catch (err) {
        console.error("댓글 삭제 중 오류:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});


module.exports = router;