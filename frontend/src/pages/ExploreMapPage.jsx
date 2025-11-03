// frontend/src/pages/ExploreMapPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/ExploreMapPage.scss';
import { getPublicLogs } from '../api/publicService';

// Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';

// --- ▼▼▼ [수정] 클러스터 CSS 임포트 경로 (이 3줄이 정답입니다) ▼▼▼ ---
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
// --- ▲▲▲ ---

// --- (필수) '핀 없음' 문제 해결 (아이콘 경로 수동 설정) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// --- 👆👆👆 ---

export default function ExploreMapPage() {
    const [logs, setLogs] = useState([]);
    const seoulCityHall = [37.5665, 126.9780];
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // (에러 state 추가)

    useEffect(() => {
        const fetchPublicLogs = async () => {
            try {
                const res = await getPublicLogs();
                setLogs(res.data);
            } catch (err) {
                console.error("공개 로그 목록 불러오기 실패:", err);
                setError("데이터를 불러오는 데 실패했습니다."); // (에러 설정)
            }
            setLoading(false);
        };
        fetchPublicLogs();
    }, []);

    if (loading) {
        return <div className="explore-map-container">
            <h2>전체 공개 지도</h2>
            <p>데이터를 불러오는 중입니다...</p>
        </div>
    }

    if (error) {
        return <div className="explore-map-container">
            <h2>전체 공개 지도</h2>
            <p style={{ color: 'red' }}>{error}</p>
        </div>
    }

    return (
        <div className="explore-map-container">
            <h2 style={{ marginTop: 0 }}>전체 공개 지도</h2>
            <p>모든 유저들이 공유한 라이딩 로그입니다.</p>

            {/* (로그가 0개일 때 메시지 표시) */}
            {logs.length === 0 && !loading && (
                <p>아직 '전체 공개'된 로그가 없습니다. 새 로그를 작성해보세요!</p>
            )}

            <div
                className="map-area"
                style={{ height: '75vh', width: '100%' }}
            >
                <MapContainer
                    center={seoulCityHall}
                    zoom={10}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    <MarkerClusterGroup>
                        {logs.map(log => {
                            if (!log.location) return null;
                            const pos = [
                                log.location.coordinates[1], // 위도
                                log.location.coordinates[0]  // 경도
                            ];
                            return (
                                <Marker key={log._id} position={pos}>
                                    <Popup>
                                        <div className="map-popup-content">
                                            <img
                                                src={log.imageUrl}
                                                alt={log.text}
                                                width="100"
                                            />
                                            <p>{log.text}</p>

                                            {/* [참고] 'public.js'에서 .populate()를 뺐기 때문에
                                                log.user.displayName은 없습니다.
                                                이 기능이 꼭 필요하다면, '500' 오류의
                                                근본 원인(Log 모델의 user 스키마)을 찾아야 합니다.
                                            */}
                                            {/* {log.user && log.user.displayName && (
                                                <small>by {log.user.displayName}</small>
                                            )} 
                                            */}

                                            <Link
                                                to={`/log/${log._id}`}
                                                className="btn-detail-link"
                                            >
                                                자세히 보기
                                            </Link>
                                        </div>
                                    </Popup>
                                </Marker>
                            );
                        })}
                    </MarkerClusterGroup>
                </MapContainer>
            </div>
        </div>
    );
}
