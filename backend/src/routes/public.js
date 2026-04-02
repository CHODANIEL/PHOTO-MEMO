// backend/routes/public.js

const router = require('express').Router();
const Log = require('../models/Log'); // Log 모델을 가져옵니다.

// --- 1. (수정) '전체 공개'된 모든 로그 불러오기 ---
// (GET /api/public/logs)
router.get('/logs', async (req, res) => {
    try {
        // --- ▼▼▼ [수정] .populate() 제거 ▼▼▼ ---
        const publicLogs = await Log.find({ isPublic: true })
            .sort({ createdAt: -1 });
        // --- ▲▲▲ ---

        res.status(200).json(publicLogs);

    } catch (err) {
        console.error("공개 로그 불러오기 실패:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// --- 2. (수정) '전체 공개' 로그 검색하기 ---
// (GET /api/public/search?q=...)
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(200).json([]);
        }

        const searchQuery = { $regex: q, $options: 'i' };

        // --- ▼▼▼ [수정] .populate() 제거 ▼▼▼ ---
        const searchResults = await Log.find({
            isPublic: true,
            $or: [
                { text: searchQuery },
                { tags: searchQuery }
            ]
        })
            .sort({ createdAt: -1 });
        // --- ▲▲▲ ---

        res.status(200).json(searchResults);

    } catch (err) {
        console.error("공개 로그 검색 실패:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

module.exports = router;