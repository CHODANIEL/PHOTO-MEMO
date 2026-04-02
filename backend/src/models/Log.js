// backend/models/Log.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// (locationSchema는 동일)
const locationSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number],
        required: true
    }
});

// --- 👇👇👇 (신규) '댓글'을 위한 서브 스키마 ---
const commentSchema = new Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    user: { // 댓글 작성자
        type: Schema.Types.ObjectId,
        ref: 'User', // User 모델과 연결
        required: true
    }
}, { timestamps: true }); // 댓글의 'createdAt' 자동 생성
// --- 👆👆👆 ---


const LogSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    text: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    location: { type: locationSchema, index: '2dsphere' },
    tags: [String],
    isPublic: { type: Boolean, default: false, index: true },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // --- 👇👇👇 '댓글' 배열 추가 ---
    comments: [commentSchema] // 위에서 만든 'commentSchema'를 배열로 가짐
    // --- 👆👆👆 ---

}, { timestamps: true }); // 로그의 'createdAt' 자동 생성

module.exports = mongoose.model('Log', LogSchema);