// backend/index.js (Full Version - logs.js 추가)

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
dotenv.config();

// --- 라우트 및 미들웨어 불러오기 ---
const authRoutes = require("./routes/authroutes");
const adminRoutes = require("./routes/admin");
const logRoutes = require("./routes/logs");         // 👈 1. (추가) 로그 라우트
const authMiddleware = require("./middleware/auth");
const adminMiddleware = require("./middleware/admin");

const app = express();
const PORT = process.env.PORT || 3000;

// (cors, express.json, cookieParser 미들웨어 ... 생략)
app.use(cors({
    origin: process.env.FRONT_ORIGIN,
    credentials: true
}));
app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());

// (DB 연결 ... 생략)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB 연결 성공"))
    .catch((err) => console.error("MongoDB 연결 실패:", err.message));

app.get("/", (_req, res) => res.send("PhotoMemo API OK"));

// --- API 라우터 설정 ---

// 1. '/api/users' (회원가입/로그인)
app.use("/api/users", authRoutes);

// 2. '/api/admin' (관리자 전용)
app.use("/api/admin", authMiddleware, adminMiddleware, adminRoutes);

// 3. '/api/logs' (라이딩 로그)
//    로그인한 사용자만 접근 가능하도록 authMiddleware 적용
app.use("/api/logs", authMiddleware, logRoutes); // 👈 2. (추가)

// --- 404 핸들러 ---
app.use((req, res) => {
    res.status(404).json({ message: "요청한 API 경로를 찾을 수 없습니다." });
});

// (서버 실행 ... 생략)
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});