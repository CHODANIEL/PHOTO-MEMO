// src/components/common/AdminRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function AdminRoute() {
    const user = JSON.parse(localStorage.getItem('user'));

    // 1. 로그인을 했고 (user)
    // 2. 그 유저의 role이 'admin'인가?
    if (user && user.role === 'admin') {
        return <Outlet />; // 통과 -> 관리자 페이지 보여줌
    }

    // 관리자가 아니면 '내 지도' 페이지로 튕겨냄
    alert("관리자만 접근 가능합니다.");
    return <Navigate to="/map" replace />; 
}