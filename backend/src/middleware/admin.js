// backend/middleware/admin.js

const adminMiddleware = (req, res, next) => {
    // 이 미들웨어는 'auth.js' 미들웨어 *다음에* 실행됩니다.
    // 'auth.js'가 req.user에 유저 정보를 넣어줍니다. (토큰의 'id', 'role' 등)

    if (req.user && req.user.role === 'admin') {
        // req.user가 존재하고, role이 'admin'이면 통과
        next();
    } else {
        // 관리자가 아니면 403 (Forbidden) 에러 반환
        return res.status(403).json({ message: "접근 권한이 없습니다. (관리자 아님)" });
    }
};

module.exports = adminMiddleware;