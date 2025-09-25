// src/index.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();

const authRoutes = require("./routes/authroutes");

const app = express();                 // ✅ app은 먼저 생성
const PORT = process.env.PORT || 3000;

// 미들웨어
app.use(cors({
    origin: process.env.FRONT_ORIGIN || "http://localhost:5173",
    credentials: true,
}));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// DB 연결
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB 연결 성공"))
    .catch((err) => console.error("MongoDB 연결 실패:", err.message));

// 기본 라우트
app.get("/", (_req, res) => res.send("PhotoMemo API OK"));

// ✅ 회원 인증 라우트 등록 (한 번만)
app.use("/api/auth", authRoutes);

// 에러 처리 (마지막)
app.use((err, req, res, next) => {
    console.error("서버 오류:", err);
    res.status(500).json({ message: "서버 오류" });
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});