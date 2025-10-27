// backend/models/Log.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// --- (신규) GeoJSON을 위한 locationSchema ---
// MongoDB의 Geospatial(지리 공간) 기능을 사용하기 위한 스키마
const locationSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'], // 'Point' 타입만 허용
        required: true
    },
    coordinates: {
        type: [Number], // [경도(longitude), 위도(latitude)] 순서로 저장
        required: true
    }
});

const LogSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true 
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    
    // 👇👇👇 여기가 수정되었습니다! (String -> locationSchema)
    location: {
        type: locationSchema, // 위에서 정의한 GeoJSON 스키마 사용
        // (참고) 2dsphere 인덱스를 추가해야 $near (주변 찾기) 쿼리가 가능
        index: '2dsphere' 
    },
    
    tags: [String] 

}, { timestamps: true }); 

module.exports = mongoose.model('Log', LogSchema);