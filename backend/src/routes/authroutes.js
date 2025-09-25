const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

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

module.exports = router;