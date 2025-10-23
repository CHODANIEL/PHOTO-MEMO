// backend/routes/authroutes.js

const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const User = require("../models/User")
const auth = require("../middleware/auth") // 👈 1. auth 미들웨어 불러오기

// (makeToken 함수는 동일)
function makeToken(user) {
    return jwt.sign(
        { id: user._id.toString(), role: user.role, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// --- 1. 공개 라우트 (로그인 필요 없음) ---

// POST /api/users/register
router.post("/register", async (req, res) => {
    // (회원가입 로직은 동일)
    try {
        const { email, password, displayName, role } = req.body
        if (!email || !password) {
            return res.status(400).json({ message: "이메일/비밀번호 필요" })
        }
        const exists = await User.findOne({ email: email.toLowerCase() })
        if (exists) {
            return res.status(400).json({ message: "이미 가입된 이메일" })
        }
        const passwordHash = await bcrypt.hash(password, 10)
        const validRoles = ["user", "admin"]
        const safeRole = validRoles.includes(role) ? role : "user"
        const user = await User.create({
            email,
            displayName,
            passwordHash,
            role: safeRole
        })
        res.status(201).json({ user: user.toSafeJSON() })
    } catch (error) {
        return res.status(500).json({
            message: "회원가입 실패",
            error: error.message
        })
    }
});

// POST /api/users/login
router.post("/login", async (req, res) => {
    // (로그인 로직은 동일)
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email: email.toLowerCase(), isActive: true })
        const invalidMsg = { message: "이메일 또는 비밀번호가 올바르지 않습니다." };
        if (!user) {
            return res.status(400).json({ ...invalidMsg })
        }
        const ok = await user.comparePassword(password)
        if (!ok) {
            user.loginAttempts += 1
            const remaining = Math.max(0, 5 - user.loginAttempts)
            if (user.loginAttempts >= 5) {
                user.isActive = false
                await user.save()
                return res.status(423).json({ message: "계정이 잠겼습니다." })
            }
            await user.save()
            return res.status(400).json({ ...invalidMsg })
        }
        user.loginAttempts = 0
        user.isLoggined = true
        user.lastLoginAt = new Date()
        await user.save()
        const token = makeToken(user)
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.status(200).json({ user: user.toSafeJSON(), token })
    } catch (error) {
        return res.status(500).json({
            message: "로그인 실패",
            error: error.message
        })
    }
});


// --- 2. 보호된 라우트 (로그인 필요) ---

// GET /api/users/users
// 👇👇👇 2. 'auth' 미들웨어를 추가합니다.
router.get("/users", auth, async (req, res) => {
    try {
        const me = await User.findById(req.user.id)
        if (!me) return res.status(4404).json({ message: '사용자 없음' })
        if (me.role !== 'admin') {
            return res.status(403).json({ message: '권한 없음' })
        }
        const users = await User.find().select('-passwordHash')
        return res.status(200).json({ users })
    } catch (error) {
        res.status(401).json({ message: "조회 실패", error: error.message })
    }
});

// POST /api/users/logout
// 👇👇👇 3. 'auth' 미들웨어를 추가합니다.
router.post("/logout", auth, async (req, res) => {
    try {
        await User.findByIdAndUpdate(
            req.user.id,
            { $set: { isLoggined: false }, },
            { new: true }
        )
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        })
        return res.status(200).json({ message: '로그아웃 성공' })
    } catch (error) {
        return res.status(500).json({ message: '로그아웃 실패', error: error.message })
    }
});

module.exports = router;