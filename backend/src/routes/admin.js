// backend/routes/admin.js

const router = require('express').Router();
const User = require('../models/User'); // 👈 User 모델 필요
const Log = require('../models/Log');   // 👈 Log 모델 필요

// (기존) GET /api/admin/dashboard
router.get('/dashboard', (req, res) => {
    res.status(200).json({
        message: "관리자 대시보드입니다.",
        adminUser: req.user 
    });
});

// --- (신규) 1. 모든 유저 목록 불러오기 ---
// GET /api/admin/users
router.get('/users', async (req, res) => {
    try {
        // (보안) 비밀번호 해시값은 제외하고 전송
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (err) {
        console.error("관리자: 유저 목록 조회 실패", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// --- (신규) 2. 모든 로그 목록 불러오기 (최신순) ---
// GET /api/admin/logs
router.get('/logs', async (req, res) => {
    try {
        const logs = await Log.find()
            .populate('user', 'displayName email') // (중요) 로그 주인의 정보도 포함
            .sort({ createdAt: -1 });
            
        res.status(200).json(logs);
    } catch (err) {
        console.error("관리자: 로그 목록 조회 실패", err);
        res.status(500).json({ message: "서버 오류" });
    }
});

// --- (신규) 3. 유저 역할(role) 변경하기 ---
// PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body; // 👈 프론트에서 "admin" 또는 "user"를 보냄

        if (role !== 'admin' && role !== 'user') {
            return res.status(400).json({ message: "유효한 역할이 아닙니다." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { role: role } },
            { new: true } // 👈 (필수) 업데이트된 문서를 반환
        ).select('-passwordHash');

        if (!updatedUser) {
            return res.status(404).json({ message: "유저를 찾을 수 없습니다." });
        }
        
        res.status(200).json(updatedUser);

    } catch (err) {
        console.error("관리자: 유저 역할 변경 실패", err);
        res.status(500).json({ message: "서버 오류" });
    }
});


module.exports = router;