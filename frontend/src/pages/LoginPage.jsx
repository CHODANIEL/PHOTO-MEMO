// src/pages/LoginPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const res = await axios.post(
                
                'http://localhost:3000/api/users/login',
                { email, password },
                {
                    withCredentials: true
                }
            );

            localStorage.setItem('user', JSON.stringify(res.data.user));
            alert('로그인 성공!');
            navigate('/map');

        } catch (err) {
            const errMsg = err.response?.data?.message || "로그인에 실패했습니다.";
            setError(errMsg);
        }
    };

    return (
        <section className="login-page" style={{ padding: '20px' }}>
            <h2>로그인</h2>
            <form onSubmit={handleLogin}>
                {/* ... (폼 UI는 동일) ... */}
                <div className="form-group">
                    <label htmlFor="email">이메일</label>
                    <input
                        id="email" type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)} required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">비밀번호</label>
                    <input
                        id="password" type="password" value={password}
                        onChange={(e) => setPassword(e.target.value)} required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit" className="btn btn-primary">로그인</button>
            </form>
            <div style={{ marginTop: '20px' }}>
                <p>
                    아직 계정이 있으신가요?
                    <Link to="/register" style={{ marginLeft: '10px', color: 'blue' }}>
                        회원가입하러 가기
                    </Link>
                </p>
            </div>
        </section>
    );
}