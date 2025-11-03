// backend/routes/public.js
// (새 파일 생성)

const router = require('express').Router();
const Log = require('../models/Log'); // Log 모델을 가져옵니다.

// --- 1. (신규) '전체 공개'된 모든 로그 불러오기 ---
// (목표) GET /api/public/logs
router.get('/logs', async (req, res) => {
    try {
        // 'isPublic: true' (공개)인 로그만 찾습니다.
        const publicLogs = await Log.find({ isPublic: true })
            .sort({ createdAt: -1 }) // 최신순으로 정렬
            .populate('user', 'displayName'); // 작성자 이름 포함

        res.status(200).json(publicLogs);

    } catch (err) {
        console.error("공개 로그 불러오기 실패:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// --- 2. (신규) '전체 공개' 로그 검색하기 ---
// (목표) GET /api/public/search?q=...
router.get('/search', async (req, res) => {
    try {
        // 1. 프론트엔드에서 보낸 쿼리 파라미터(q)를 받습니다.
        const { q } = req.query;

        // 검색어가 없으면 빈 배열 반환
        if (!q) {
            return res.status(200).json([]);
        }

        // 2. MongoDB 정규식(regex)을 사용해 '대소문자 구분 없이' 검색
        // (SQL의 'LIKE %query%'와 유사)
        const searchQuery = { $regex: q, $options: 'i' };

        // 3. '공개'이면서(isPublic: true), 
        //    'text' 또는 'tags'에 검색어가 포함된 로그를 찾습니다.
        const searchResults = await Log.find({
            isPublic: true,
            $or: [
                { text: searchQuery },
                { tags: searchQuery }
            ]
        })
            .sort({ createdAt: -1 })
            .populate('user', 'displayName');

        res.status(200).json(searchResults);

    } catch (err) {
        console.error("공개 로그 검색 실패:", err);
        res.status(500).json({ message: "서버 오류" });
    }
});


module.exports = router;