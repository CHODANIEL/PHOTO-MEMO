// src/api/logService.js
import axios from 'axios';

// 1. axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true
});

// (GET) 내 모든 로그 가져오기
export const getLogs = () => {
    return api.get('/logs');
};

// (GET) ID로 로그 1개 가져오기
export const getLogById = (logId) => {
    return api.get(`/logs/${logId}`);
};

// (POST) 새 로그 생성하기
export const createLog = (formData) => {
    return api.post('/logs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    });
};

// (DELETE) 로그 삭제하기
export const deleteLog = (logId) => {
    return api.delete(`/logs/${logId}`);
};

// (PUT) 로그 수정하기
export const updateLog = (logId, updatedData) => {
    return api.put(`/logs/${logId}`, updatedData);
};

// (PUT) '좋아요' 토글
export const toggleLikeLog = (logId) => {
    return api.put(`/logs/${logId}/like`);
};

// --- 👇👇👇 (신규) '댓글' 함수 2개 추가 ---

/**
 * (POST) 새 댓글 작성
 * @param {string} logId - 로그 ID
 * @param {string} text - 댓글 내용
 */
export const addComment = (logId, text) => {
    return api.post(`/logs/${logId}/comment`, { text: text });
};

/**
 * (DELETE) 댓글 삭제
 * @param {string} logId - 로그 ID
 * @param {string} commentId - 댓글 ID
 */
export const deleteComment = (logId, commentId) => {
    return api.delete(`/logs/${logId}/comment/${commentId}`);
};
// --- 👆👆👆 ---