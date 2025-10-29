// src/api/logService.js
import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true
});

// (GET) 내 모든 로그 가져오기
export const getLogs = () => {
    return api.get('/logs');
};

// (신규) ID로 로그 1개 가져오기
export const getLogById = (logId) => {
    return api.get(`/logs/${logId}`);
};

// (POST) 새 로그 생성하기
export const createLog = (formData) => {
    return api.post('/logs', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
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