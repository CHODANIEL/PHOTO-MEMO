// src/components/common/Header.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../api/authService';
import './styles/Header.scss';

export default function Header() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // 👇 1. 로그인 상태에 따라 로고가 가야 할 경로를 변수로 저장
    const logoLinkPath = user ? "/map" : "/";

    const handleLogout = async () => {
        await logout();
        alert('로그아웃 되었습니다.');
        navigate('/');
    };

    return (
        <header className="site-header">
            <div className="header-content">
                
                {/* 👇 2. 로고의 'to' 속성에서 변수 사용 */}
                <Link to={logoLinkPath} className="logo">
                    PHOTO MEMO 🏍️
                </Link>

                <nav className="nav-links">
                    {user ? (
                        <>
                            <span className="nav-user-welcome">
                                환영합니다, {user.displayName}님!
                            </span>
                            <Link to="/map" className="nav-link">
                                내 지도
                            </Link>
                            <Link to="/add" className="nav-link btn-add">
                                + 새 로그 작성
                            </Link>
                            <button onClick={handleLogout} className="btn-logout">
                                로그아웃
                            </button>
                        </>
                    ) : (
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