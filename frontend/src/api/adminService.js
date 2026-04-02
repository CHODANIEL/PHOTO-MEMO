// src/api/adminService.js

import axios from 'axios';

// 1. axios 인스턴스 생성
const api = axios.create({
    baseURL: 'http://localhost:3000/api/admin', // 👈 (중요) 기본 경로가 /admin
    withCredentials: true
});

// (GET) 모든 유저 목록 가져오기
export const getAllUsers = () => {
    return api.get('/users');
};

// (GET) 모든 로그 목록 가져오기
export const getAllLogs = () => {
    return api.get('/logs');
};

// (PUT) 유저 역할 변경하기
export const updateUserRole = (userId, newRole) => {
    return api.put(`/users/${userId}/role`, { role: newRole });
};

// (DELETE) 관리자가 남의 로그 삭제하기 (logService에 만들어도 됨)
// (참고) routes/logs.js의 DELETE 로직에 '관리자 예외'를 추가해야 함
// export const adminDeleteLog = (logId) => {
//     return api.delete(`/logs/${logId}`); 
// };