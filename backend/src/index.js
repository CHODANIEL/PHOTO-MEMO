// backend/src/index.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require('cookie-parser');
dotenv.config();

// --- 1. 라우트 및 미들웨어 불러오기 ---
const authRoutes = require("./routes/authroutes");
const adminRoutes = require("./routes/admin");
const logRoutes = require("./routes/logs");
const publicRoutes = require("./routes/public"); // 👈 (신규) 'publicRoutes' 임포트
const authMiddleware = require("./middleware/auth");
const adminMiddleware = require("./middleware/admin");

const app = express();
const PORT = process.env.PORT || 3000;

// --- 2. 미들웨어 설정 ---
app.use(cors({
    origin: process.env.FRONT_ORIGIN, // .env의 'http://localhost:5173'
    credentials: true
}));
app.use(express.json({ limit: "2mb" })); // JSON 파싱
app.use(cookieParser()); // 쿠키 파싱

// --- 3. DB 연결 ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB 연결 성공"))
    .catch((err) => console.error("MongoDB 연결 실패:", err.message));

// --- 4. 기본 라우트 ---
app.get("/", (_req, res) => res.send("PhotoMemo API OK"));

// --- 5. API 라우터 설정 ---

// 5-1. (공개) 인증 불필요: 회원가입, 로그인
app.use("/api/users", authRoutes);

// 5-2. (신규/공개) 인증 불필요: '전체 공개' 로그
app.use("/api/public", publicRoutes); // 👈 (신규) 라우트 등록

// 5-3. (보호) 인증 필요: '내' 로그 (생성, 조회, 수정, 삭제)
app.use("/api/logs", authMiddleware, logRoutes);

// 5-4. (관리자 보호) 인증 + 관리자 권한 필요
app.use("/api/admin", authMiddleware, adminMiddleware, adminRoutes);

// --- 6. 404 핸들러 (일치하는 라우트가 없을 때) ---
app.use((req, res) => {
    res.status(404).json({ message: "요청한 API 경로를 찾을 수 없습니다." });
});

// --- 7. 서버 실행 ---
app.listen(PORT, () => {
    console.log(`Server running: http://localhost:${PORT}`);
});
