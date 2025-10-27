// backend/routes/logs.js

const router = require('express').Router();
const Log = require('../models/Log');
const upload = require('../middleware/upload');
const multer = require('multer');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');

// (S3 클라이언트 ... 생략)
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// --- 1. 새 라이딩 로그 생성 (수정됨) ---
// POST /api/logs
router.post(
    '/',
    upload.single('image'),
    async (req, res) => {
        try {
            // 👇 1. 프론트에서 보낼 데이터 변경 (location 문자열 -> lat, lng)
            const { text, tags, latitude, longitude } = req.body;

            if (!req.file || !text) {
                return res.status(400).json({ message: "이미지와 텍스트는 필수입니다." });
            }

            const imageUrl = req.file.location;
            const userId = req.user.id;

            // 👇 2. location (GeoJSON) 객체 생성
            let locationData = null;
            if (latitude && longitude) {
                locationData = {
                    type: 'Point',
                    // (중요!) GeoJSON은 [경도(longitude), 위도(latitude)] 순서입니다.
                    coordinates: [parseFloat(longitude), parseFloat(latitude)]
                };
            }

            const newLog = new Log({
                user: userId,
                text: text,
                imageUrl: imageUrl,
                location: locationData, // 👈 3. GeoJSON 객체를 저장
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

// --- 2. 나의 모든 로그 불러오기 (동일) ---
router.get('/', async (req, res) => {
    // ... (변경 없음)
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

// --- 3. 특정 로그 수정하기 (수정됨) ---
router.put('/:id', async (req, res) => {
    try {
        const logId = req.params.id;
        // 👇 1. 프론트에서 보낼 데이터 변경
        const { text, tags, latitude, longitude } = req.body;
        const userId = req.user.id;

        const log = await Log.findById(logId);
        if (!log) return res.status(404).json({ message: "로그를 찾을 수 없습니다." });
        if (log.user.toString() !== userId) {
            return res.status(403).json({ message: "수정 권한이 없습니다." });
        }

        // 텍스트, 태그 업데이트
        log.text = text || log.text;
        log.tags = tags ? tags.split(',') : log.tags;

        // 👇 2. location (GeoJSON) 객체 업데이트
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
        res.status(500).json({ message: "로그 수정 중 오류가 발생했습니다.", error: err.message });
    }
});

// --- 4. 특정 로그 삭제하기 (동일) ---
router.delete('/:id', async (req, res) => {
    // ... (변경 없음)
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
        res.status(200).json({ message: "로그가 성공적으로 삭제되었습니다.", deletedLogId: logId });
    } catch (err) {
        console.error("로그 삭제 중 에러:", err);
        res.status(500).json({ message: "로그 삭제 중 오류가 발생했습니다.", error: err.message });
    }
});

module.exports = router;