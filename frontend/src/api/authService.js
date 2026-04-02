// src/api/authService.js
import axios from 'axios';

// 1. axios 인스턴스 생성 (공통 설정)
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true
});

// 2. 로그아웃 함수
export const logout = async () => {
    try {
        await api.post('/users/logout');
        localStorage.removeItem('user');
        return { success: true };
    } catch (err) {
        console.error("로그아웃 API 실패:", err);
        // 실패하더라도 로컬 데이터는 지우는 것이 좋습니다.
        localStorage.removeItem('user');
        return { success: false, error: err };
    }
};

// (참고) 로그인, 회원가입 함수도 나중에 여기로 옮기면 좋습니다.