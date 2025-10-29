// src/components/common/Header.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../api/authService';
import './styles/Header.scss'; // (VSCode 구조 확인 - 이 경로가 맞습니다)

export default function Header() {
    const navigate = useNavigate();

    // localStorage에서 'user' 문자열을 가져와 JSON 객체로 파싱
    const user = JSON.parse(localStorage.getItem('user'));

    // 로그인 상태에 따라 로고가 가야 할 경로
    const logoLinkPath = user ? "/map" : "/";

    // 1. handleLogout 함수를 올바르게 채웁니다.
    const handleLogout = async () => {
        await logout(); // authService에서 API 호출 및 localStorage.removeItem('user') 실행
        alert('로그아웃 되었습니다.');
        navigate('/'); // 홈으로 이동
    };

    return (
        <header className="site-header">
            <div className="header-content">

                <Link to={logoLinkPath} className="logo">
                    PHOTO MEMO 🏍️
                </Link>

                <nav className="nav-links">
                    {user ? (
                        // --- 1. 로그인한 유저 메뉴 ---
                        <>
                            <span className="nav-user-welcome">
                                환영합니다, {user.displayName}님!
                            </span>

                            {/* 관리자(admin)일 경우 [관리자] 링크 표시 */}
                            {user.role === 'admin' && (
                                <Link to="/admin" className="nav-link-admin">
                                    [관리자]
                                </Link>
                            )}

                            <Link to="/map" className="nav-link">
                                내 지도
                            </Link>

                            <Link to="/logs" className="nav-link">
                                전체 목록
                            </Link>

                            <Link to="/add" className="nav-link btn-add">
                                + 새 로그 작성
                            </Link>
                            <button onClick={handleLogout} className="btn-logout">
                                로그아웃
                            </button>
                        </>
                    ) : (
                        // --- 2. (수정) 비로그인 유저 메뉴 (에러가 났던 부분) ---
                        <>
                            <Link to="/login" className="nav-link">
                                로그인
                            </Link>
                            <Link to="/register" className="nav-link">
                                회원가입
                            </Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}