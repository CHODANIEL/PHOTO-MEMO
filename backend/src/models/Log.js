// backend/models/Log.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LogSchema = new Schema({
    // 1. 작성자 (User 모델과 연결)
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User', // 'User' 모델을 참조
        required: true,
        index: true // 작성자별로 검색을 빠르게 하기 위함
    },
    // 2. 텍스트 메모
    text: {
        type: String,
        required: true,
        trim: true
    },
    // 3. 사진 URL (S3에 업로드된 경로)
    imageUrl: {
        type: String,
        required: true
    },
    // 4. 위치 (좌표 또는 주소 문자열)
    location: {
        // (나중에 지도 API 연동 시 위도/경도(GeoJSON)로 바꾸면 좋습니다)
        type: String,
        default: ""
    },
    // 5. 태그
    tags: [String] // '#속초', '#맛집' 등을 배열로 저장

}, { timestamps: true }); // createdAt (작성일) 자동 생성

module.exports = mongoose.model('Log', LogSchema);