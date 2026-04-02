// src/pages/ExploreListPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// 👇 이 페이지 전용 SCSS
import './styles/ExploreListPage.scss';
// 👇 MapPage와 동일한 'publicService' 사용
import { getPublicLogs } from '../api/publicService';

// (공용 컴포넌트가 있다면 사용하셔도 좋습니다)
const LoadingSpinner = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        로딩 중입니다...
    </div>
);

export default function ExploreListPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // (에러 처리 state)

    useEffect(() => {
        const fetchPublicLogs = async () => {
            try {
                const res = await getPublicLogs();
                setLogs(res.data);
            } catch (err) {
                console.error("공개 로그 목록(리스트) 불러오기 실패:", err);
                setError("데이터를 불러오는 데 실패했습니다.");
            }
            setLoading(false);
        };
        fetchPublicLogs();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="explore-list-container">
            <h2>전체 공개 로그</h2>
            <p>모든 유저들이 공유한 라이딩 로그입니다.</p>

            {/* --- 로그 카드 리스트 --- */}
            <div className="log-list-grid">
                {logs.length > 0 ? (
                    logs.map(log => (
                        <Link to={`/log/${log._id}`} key={log._id} className="log-card-link">
                            <div className="log-card">
                                <img
                                    src={log.imageUrl}
                                    alt={log.text}
                                    className="card-image"
                                />
                                <div className="card-content">
                                    <p className="card-text">{log.text}</p>
                                    <small className="card-author">
                                        by {log.user.displayName}
                                    </small>
                                    <small className="card-date">
                                        {new Date(log.createdAt).toLocaleDateString()}
                                    </small>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <p>아직 공유된 로그가 없습니다.</p>
                )}
            </div>
        </div>
    );
}