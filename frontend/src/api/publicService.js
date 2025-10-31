// src/api/publicService.js
import axios from 'axios';

// 1. axios 인스턴스 생성 (인증 *불필요*)
const api = axios.create({
    baseURL: 'http://localhost:3000/api/public',
});

/**
 * (GET) '전체 공개' 로그 목록 가져오기
 */
export const getPublicLogs = () => {
    return api.get('/logs');
};
