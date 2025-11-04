import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { logout } from '../../api/authService';
import './styles/Header.scss';

export default function Header() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // --- ▼▼▼ [수정] 로고 링크 경로 ---
    // (기존: user ? "/map" : "/")
    // '전체 공개 지도'를 메인으로 사용하기 위해 경로를 고정합니다.
    const logoLinkPath = "/explore-map";
    // --- ▲▲▲ ---

    const handleLogout = async () => {
        await logout();
        alert('로그아웃 되었습니다.');
        window.location.href = '/';
    };

    return (
        <header className="site-header">
            <div className="header-content">

                {/* --- 1. 로고 (이제 항상 /explore-map 으로 이동) --- */}
                <Link to={logoLinkPath} className="logo">
                    BIKE MEMO
                </Link>

                {/* --- 2. 네비게이션 링크 --- */}
                <nav className="nav-links">
                    {user ? (
                        // --- (A) 로그인 유저 (요청 순서) ---
                        <>
                            <span className="nav-user-welcome">환영합니다, {user.displayName}님!</span>
                            <NavLink to="/search" className="nav-link">검색</NavLink>
                            <NavLink to="/explore-map" className="nav-link">전체 지도</NavLink>
                            <NavLink to="/map" className="nav-link">내 지도</NavLink>
                            <NavLink to="/explore-logs" className="nav-link">전체 목록</NavLink>
                            <NavLink to="/logs" className="nav-link">내 목록</NavLink>

                            {user.role === 'admin' && (
                                <NavLink to="/admin" className="nav-link-admin">
                                    [관리자]
                                </NavLink>
                            )}

                            <NavLink to="/add" className="nav-link btn-add">
                                + 새 로그 작성
                            </NavLink>
                            <button onClick={handleLogout} className="btn-logout">
                                로그아웃
                            </button>
                        </>
                    ) : (
                        // --- (B) 비로그인 유저 ---
                        <>
                            <NavLink to="/search" className="nav-link">검색</NavLink>
                            <NavLink to="/explore-map" className="nav-link">전체 지도</NavLink>
                            <NavLink to="/explore-logs" className="nav-link">전체 목록</NavLink>

                            {/* 로그인/가입 버튼을 오른쪽으로 밀기 위한 구분자 */}
                            <div className="nav-separator"></div>

                            <NavLink to="/login" className="nav-link">로그인</NavLink>
                            <NavLink to="/register" className="nav-link">회원가입</NavLink>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
