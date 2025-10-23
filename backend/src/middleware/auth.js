// backend/middleware/auth.js

const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        // 1. index.js의 cookieParser 덕분에 req.cookies 객체를 읽을 수 있음
        //    'token'은 authroutes.js에서 res.cookie('token', ...)로 저장한 이름
        const token = req.cookies.token;

        if (!token) {
            // 2. 토큰이 쿠키에 없는 경우
            return res.status(401).json({ message: "인증 토큰이 없습니다. (로그인 필요)" });
        }

        // 3. 토큰 검증 (.env의 JWT_SECRET 사용)
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 4. (가장 중요) 검증된 유저 정보를 req.user 객체에 담기
        //    authroutes.js에서 { id: ..., role: ... }로 저장했으므로,
        //    decoded가 바로 그 객체입니다.
        req.user = decoded;

        next(); // 5. 통과 -> 다음 미들웨어 또는 API 핸들러로 이동

    } catch (err) {
        // 6. 토큰이 유효하지 않거나(서명 불일치) 만료된 경우
        console.error("Auth 미들웨어 에러:", err.message);

        // (선택) 잘못된 토큰이 브라우저에 남아있지 않도록 쿠키를 지워줌
        res.clearCookie('token');

        return res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    }
};

module.exports = auth;