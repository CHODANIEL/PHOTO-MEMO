// backend/middleware/upload.js

const { S3Client } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');

// 1. S3 클라이언트 생성 (.env에서 키 자동 로드)
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

// 2. Multer-S3 스토리지 설정
const s3Storage = multerS3({
    s3: s3, // S3 클라이언트
    bucket: process.env.S3_BUCKET, // .env의 버킷 이름
    // acl: 'public-read', // 👈 이 줄을 삭제하거나 주석 처리합니다!
    metadata: (req, file, cb) => {
        cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
        // 파일 이름 설정: "logs/[유저ID]_[현재시간].[확장자]"
        // (참고) auth.js가 id를 넣으므로 req.user.id로 수정
        const userId = req.user.id;
        const uniqueSuffix = Date.now();
        const extension = path.extname(file.originalname);
        cb(null, `logs/${userId}_${uniqueSuffix}${extension}`);
    }
});

// 3. 파일 필터 (이미지 파일만 허용)
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true); // 통과
    } else {
        cb(new Error('이미지 파일만 업로드할 수 있습니다.'), false); // 거부
    }
};

// 4. Multer 업로드 미들웨어 생성
const upload = multer({
    storage: s3Storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB 제한
    }
});

module.exports = upload;