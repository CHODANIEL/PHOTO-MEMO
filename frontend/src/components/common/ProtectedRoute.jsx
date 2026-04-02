// src/components/common/ProtectedRoute.jsx

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute() {
    // 1. localStorage에서 'authToken' 대신 'user' 정보를 가져옵니다.
    const user = localStorage.getItem('user');

    // 2. 'user' 정보가 있으면 (로그인 상태이면) 자식 컴포넌트(MapPage 등)를 보여줍니다.
    if (user) {
        return <Outlet />;
    }

    // 3. 'user' 정보가 없으면 로그인 페이지로 튕겨냅니다.
    return <Navigate to="/login" replace />;
}