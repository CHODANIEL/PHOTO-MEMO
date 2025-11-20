// frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './styles/LoginPage.scss'; // (로그인 페이지 전용 SCSS 임포트)

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // (참고: authService.js로 분리하는 것이 더 좋습니다)
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users/login`, // (백엔드 주소)
                { email, password },
                {
                    withCredentials: true // (httpOnly 쿠키를 위해)
                }
            );

            // (authService.js에서 했다면 이 로직이 필요 없을 수 있음)
            localStorage.setItem('user', JSON.stringify(res.data.user));

            alert('로그인 성공!');
            navigate('/map'); // (로그인 후 '내 지도'로 이동)

        } catch (err) {
            const errMsg = err.response?.data?.message || "로그인에 실패했습니다.";
            setError(errMsg);
        }
    };

    // (이전 코드와 달리, LandingPage가 아닌 로그인 폼을 렌더링)
    return (
        <section className="auth-page-container">
            <div className="auth-form-card">
                <h2>로그인</h2>
                <form onSubmit={handleLogin} className="auth-form">

                    <div className="form-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-message">{error}</p>}

                    <button type="submit" className="btn btn-primary">로그인</button>
                </form>

                <div className="auth-switch-link">
                    <p>
                        아직 계정이 없으신가요?
                        <Link to="/register">
                            회원가입 하러 가기
                        </Link>
                    </p>
                </div>
            </div>
        </section>
    );
}
