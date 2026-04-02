// src/pages/HomePage.jsx
// (새 파일 생성)

import React from 'react';
import { Navigate } from 'react-router-dom';
import LandingPage from './LandingPage'; // 1. 기존 공용 홈페이지

export default function HomePage() {
    // 2. localStorage에서 유저 정보 확인
    const user = localStorage.getItem('user');

    if (user) {
        // 3. 유저가 있으면, '/map' (내 지도) 페이지로 강제 이동
        return <Navigate to="/map" replace />;
    } else {
        // 4. 유저가 없으면, 공용 홈페이지를 보여줌
        return <LandingPage />;
    }
}