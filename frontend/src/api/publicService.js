// src/api/publicService.js
// (새 파일 생성)

import axios from 'axios';

// 1. axios 인스턴스 생성
// (주의!) 이 API는 '로그인'이 필요 없으므로,
// 'withCredentials: true'가 *빠져야* 합니다.
const api = axios.create({
    baseURL: 'http://localhost:3000/api/public'
});

/**
 * (GET) '전체 공개'된 모든 로그 목록 가져오기
 * (호출 경로: /api/public/logs)
 */
export const getPublicLogs = () => {
    return api.get('/logs');
};

/**
 * (GET) '전체 공개' 로그 검색하기
 * @param {string} query - 검색어
 * (호출 경로: /api/public/search?q=...)
 */
export const searchPublicLogs = (query) => {
    // 👇 baseURL('/api/public') 뒤에 '/search'가 붙도록 수정
    return api.get(`/search?q=${query}`);
};

// (중복되었던 두 번째 함수는 삭제했습니다)