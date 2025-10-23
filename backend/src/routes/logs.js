// backend/routes/logs.js

const router = require('express').Router();
const Log = require('../models/Log');
const upload = require('../middleware/upload');
const multer = require('multer');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3'); // S3 삭제용

// (S3 클라이언트 생성 - 삭제 시 필요)
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
            const { text, location, tags } = req.body;
            if (!req.file) {
                return res.status(400).json({ message: "이미지 파일이 필요합니다." });
            }
            const imageUrl = req.file.location;
            const userId = req.user.id;

            const newLog = new Log({
                user: userId,
                text: text,
                imageUrl: imageUrl,
                location: location || "",
                tags: tags ? tags.split(',') : []
            });
            const savedLog = await newLog.save();
            res.status(201).json(savedLog);
        } catch (err) {
            console.error(err);
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: err.message });
            }
            res.status(500).json({ message: "로그 작성 중 서버 오류가 발생했습니다.", error: err.message });
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
        res.status(500).json({ message: "로그를 불러오는 중 오류가 발생했습니다.", error: err.message });
    }
});

// --- 3. 특정 로그 수정하기 ---
// PUT /api/logs/:id
router.put('/:id', async (req, res) => {
    try {
        const logId = req.params.id;
        const { text, location, tags } = req.body;
        const userId = req.user.id;

        const log = await Log.findById(logId);
        if (!log) {
            return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        }
        if (log.user.toString() !== userId) {
            return res.status(403).json({ message: "수정 권한이 없습니다." });
        }

        log.text = text || log.text;
        log.location = location || log.location;
        log.tags = tags ? tags.split(',') : log.tags;

        const updatedLog = await log.save();
        res.status(200).json(updatedLog);

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "로그 수정 중 오류가 발생했습니다.", error: err.message });
    }
});

// --- 4. (신규) 특정 로그 삭제하기 ---
// DELETE /api/logs/:id
router.delete('/:id', async (req, res) => {
    try {
        const logId = req.params.id;
        const userId = req.user.id;

        const log = await Log.findById(logId);
        if (!log) {
            return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        }
        if (log.user.toString() !== userId) {
            return res.status(403).json({ message: "삭제 권한이 없습니다." });
        }

        // --- 👇 여기가 수정되었습니다! ---
        // S3 Key (파일 경로) 추출 로직 변경
        // 1. URL 객체 생성
        const imageUrl = new URL(log.imageUrl);
        // 2. pathname (예: /logs/file_name.jpg)에서 맨 앞 '/' 제거
        const s3Key = imageUrl.pathname.substring(1);
        // --- 👆 여기까지 ---

        // 3. (S3) 이미지 파일 삭제
        await s3.send(new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET,
            Key: s3Key // 이제 s3Key는 'logs/file_name.jpg' 형태가 됩니다.
        }));

        // 4. (DB) 로그 삭제
        await Log.findByIdAndDelete(logId);

        res.status(200).json({ message: "로그가 성공적으로 삭제되었습니다.", deletedLogId: logId });

    } catch (err) {
        console.error("로그 삭제 중 에러:", err); // 👈 (수정) 에러 로그 강화
        res.status(500).json({ message: "로그 삭제 중 오류가 발생했습니다.", error: err.message });
    }
});

module.exports = router;