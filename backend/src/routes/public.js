// backend/routes/public.js

const router = require('express').Router();
const Log = require('../models/Log');

// --- (신규) 전체 공개 로그 불러오기 ---
// GET /api/public/logs
router.get('/logs', async (req, res) => {
    try {
        // isPublic이 true인 로그만 찾아서, 
        // 작성자 정보(displayName)와 함께,
        // 최신순으로 정렬
        const publicLogs = await Log.find({ isPublic: true })
            .populate('user', 'displayName')
            .sort({ createdAt: -1 });

        res.status(200).json(publicLogs);

    } catch (err) {
        console.error("공개 로그 조회 실패:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

module.exports = router;