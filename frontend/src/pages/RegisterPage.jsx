// src/pages/RegisterPage.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState(''); // 1. 이름 필드 추가
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // 2. 회원가입 핸들러
    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            // 3. 백엔드 /register API 호출
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/users/register`, // 👈 API 경로 변경
                {
                    email,
                    password,
                    displayName // 👈 이름(displayName) 추가
                },
                // (참고) 회원가입은 쿠키를 다루지 않으므로 withCredentials는 필수 아님
            );

            alert('회원가입 성공! 로그인 페이지로 이동합니다.');
            navigate('/login'); // 4. 성공 시 로그인 페이지로 이동

        } catch (err) {
            const errMsg = err.response?.data?.message || "회원가입에 실패했습니다.";
            setError(errMsg);
        }
    };

    return (
        <section className="register-page" style={{ padding: '20px' }}>
            <h2>회원가입</h2>
            {/* 5. onSubmit을 handleRegister로 변경 */}
            <form onSubmit={handleRegister}>
                <div className="form-group">
                    <label htmlFor="email">이메일</label>
                    <input
                        id="email" type="email" value={email}
                        onChange={(e) => setEmail(e.target.value)} required
                    />
                </div>
                {/* 6. 이름(DisplayName) 입력 필드 추가 */}
                <div className="form-group">
                    <label htmlFor="displayName">이름 (닉네임)</label>
                    <input
                        id="displayName" type="text" value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
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

                {/* 7. 버튼 텍스트 변경 */}
                <button type="submit" className="btn btn-primary">회원가입</button>
            </form>

            <div style={{ marginTop: '20px' }}>
                <p>
                    이미 계정이 있으신가요?
                    <Link to="/login" style={{ marginLeft: '10px', color: 'blue' }}>
                        로그인하러 가기
                    </Link>
                </p>
            </div>
        </section>
    );
}