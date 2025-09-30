const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

//토큰 발급
function makeToken(user) {
    return jwt.sign(
        {
            id: user._id.toString(),
            role: user.role,
            email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );
}

// 회원가입
router.post("/register", async (req, res) => {
    try {
        const { email, password, displayName = "", role = "user" } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "이메일/비밀번호 필요" });
        }

        // 중복 이메일 검사
        const exists = await User.findOne({ email: email.toLowerCase() });
        if (exists) {
            return res.status(400).json({ message: "이미 가입된 이메일입니다." });
        }


        const passwordHash = await bcrypt.hash(password, 10);


        const validRoles = ["user", "admin"];
        const finalRole = validRoles.includes(role) ? role : "user";

        // 새 유저 생성
        const user = await User.create({
            email: email.toLowerCase(),
            passwordHash,
            displayName,
            role: finalRole,
        });


        return res.status(201).json({
            message: "회원가입 성공",
            user: {
                id: user._id,
                email: user.email,
                displayName: user.displayName,
                role: user.role,
            }
        });
    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return res.status(500).json({ message: "회원가입 실패", error: error.message });
    }
});

//로그인
router.post("/login", async (req, res) => {
    try {
        const { email = "", password = "" } = req.body || {};

        const user = await User.findOne({
            email: email.toLowerCase(),
            isActive: true,
        }).select("+passwordHash");

        const INVALID = { message: "이메일 또는 비밀번호가 올바르지 않습니다." };
        if (!user) return res.status(401).json(INVALID);

        

        // 실패 횟수 확인 (5회 이상이면 차단)
        if (user.loginAttempts >= 5) {
            return res.status(423).json({ message: "로그인 시도 횟수가 초과되었습니다." });
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
            user.loginAttempts += 1;      // 실패 누적
            await user.save();
            return res.status(401).json(INVALID);
        }

        // 성공 시 초기화
        user.loginAttempts = 0;
        user.isLoggined = true;
        user.lastLoginAt = new Date();
        await user.save();

        const token = makeToken(user);
        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        const { passwordHash, __v, ...safeUser } = user.toObject();
        return res.status(200).json({ user: safeUser, token });
    } catch (err) {
        console.error("LOGIN ERROR:", err);
        return res.status(500).json({ message: "로그인 실패" });
    }
});
    
// 로그인 사용자 정보 확인
router.get("/me", async (req, res) => {
    try {
        const h = req.headers.authorization || "";
        const token = h.startsWith("Bearer ") ? h.slice(7) : null;

        if (!token) {
            return res.status(401).json({ message: "인증이 필요합니다." });
        }

        // 토큰 검증
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // 사용자 조회
        const user = await User.findById(payload.id);
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "유효하지 않은 사용자입니다." });
        }

        // 민감정보 제거 후 응답
        const { passwordHash, __v, ...safeUser } = user.toObject();
        return res.status(200).json({ user: safeUser });
    } catch (error) {
        console.error("ME ERROR:", error);
        return res.status(401).json({ message: "유효하지 않은 토큰" });
    }
});


module.exports = router;