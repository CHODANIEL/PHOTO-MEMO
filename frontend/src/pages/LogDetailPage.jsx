// src/pages/LogDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLogById } from '../api/logService';
import './styles/LogDetailPage.scss'; // (SCSS 파일도 새로 만듭니다)

// (임시) Leaflet 지도 (미니맵용)
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

export default function LogDetailPage() {
    const { id } = useParams(); // 1. URL에서 :id 값을 가져옴
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchLog = async () => {
            try {
                const res = await getLogById(id); // 2. API 호출
                setLog(res.data);
            } catch (err) {
                console.error("로그 상세 정보 불러오기 실패:", err);
                setError(err.response?.data?.message || "로그를 불러올 수 없습니다.");
            }
            setLoading(false);
        };
        fetchLog();
    }, [id]); // id가 바뀔 때마다 다시 호출

    if (loading) {
        return <div className="detail-container"><p>로딩 중...</p></div>;
    }
    if (error) {
        return <div className="detail-container"><p style={{ color: 'red' }}>{error}</p></div>;
    }
    if (!log) {
        return <div className="detail-container"><p>로그 정보를 찾을 수 없습니다.</p></div>;
    }

    // 3. 로그 위치 좌표
    const position = log.location ? [
        log.location.coordinates[1], // 위도
        log.location.coordinates[0]  // 경도
    ] : null;

    return (
        <div className="log-detail-container">
            {/* 1. 큰 원본 이미지 */}
            <img src={log.imageUrl} alt={log.text} className="detail-image" />

            <div className="detail-content">
                <h2>{log.text}</h2>
                <p className="detail-meta">
                    작성자: {log.user.displayName} <br />
                    작성일: {new Date(log.createdAt).toLocaleString('ko-KR')}
                </p>
                <div className="detail-tags">
                    {log.tags.map((tag, index) => (
                        <span key={index} className="tag">#{tag}</span>
                    ))}
                </div>

                {/* 2. 미니맵 (위치 정보가 있을 경우) */}
                {position && (
                    <div className="detail-map-area" style={{ height: '300px', width: '100%', marginTop: '20px' }}>
                        <MapContainer
                            center={position}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false} // (상세 페이지에서는 스크롤 확대 비활성화)
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={position}></Marker>
                        </MapContainer>
                    </div>
                )}

                <Link to="/map" className="btn-back-to-map">내 지도로 돌아가기</Link>
            </div>
        </div>
    );
}