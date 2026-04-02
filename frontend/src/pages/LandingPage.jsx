// src/pages/LandingPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getPublicLogs } from '../api/publicService'; // 👈 1. public API 임포트
import LogCard from '../components/common/LogCard'; // 👈 2. LogCard 임포트
import "./styles/LandingPage.scss";

export default function LandingPage() {

    // --- 👇 3. '공개 로그' state 추가 ---
    const [publicLogs, setPublicLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPublicLogs = async () => {
            try {
                const res = await getPublicLogs();
                // (선택) 최신 6개만 보여주기
                setPublicLogs(res.data.slice(0, 6));
            } catch (err) {
                console.error("공개 로그 로드 실패:", err);
            }
            setLoading(false);
        };
        fetchPublicLogs();
    }, []); // 👈 [] : 페이지 로드 시 1회 실행

    return (
        // (기존 랜딩 페이지 구조)
        <section className="landing">
            <div className="container">
                <div className="landing-hero">
                    <h1>라이딩 로그</h1>
                    <p className="landing-sub">나만의 바이크 여정. 사진, 메모, 그리고 지도 위 핀.</p>
                    <Link to="/login" className="btn btn-primary">
                        로그 시작하기
                    </Link>
                </div>

                <ul className="landing-features">
                    {/* ... (기능 소개 리스트는 동일) ... */}
                </ul>
            </div>

            {/* --- 👇 4. '최신 공개 로그' 섹션 추가 --- */}
            <section className="public-logs-section">
                <div className="container">
                    <h2>최신 공개 라이딩 로그</h2>
                    {loading ? (
                        <p>공개 로그를 불러오는 중...</p>
                    ) : (
                        <div className="log-list">
                            {publicLogs.length > 0 ? (
                                publicLogs.map(log => (
                                    <LogCard
                                        key={log._id}
                                        log={log}
                                    // (중요) 비로그인 상태이므로 수정/삭제 함수는 전달 X
                                    // onDelete={() => {}} 
                                    // onEdit={() => {}}
                                    />
                                ))
                            ) : (
                                <p>아직 공개된 로그가 없습니다.</p>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </section>
    );
}
