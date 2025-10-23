// backend/routes/admin.js

const router = require('express').Router();

// GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
    // 이 API가 실행된다는 것은, 이미 auth.js와 admin.js 미들웨어를
    // 모두 통과했다는 의미입니다.

    res.status(200).json({
        message: "관리자 대시보드에 오신 것을 환영합니다.",
        adminUser: req.user // admin.js 미들웨어가 넣어준 유저 정보
    });
});

module.exports = router;