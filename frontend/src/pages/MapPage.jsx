// src/pages/MapPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/MapPage.scss';
import axios from 'axios';

// Leaflet 라이브러리
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// ⭐ [핵심 수정] 지도가 깨지지 않도록 CSS 파일을 꼭 불러와야 합니다!
import 'leaflet/dist/leaflet.css';

// 핀 이미지 주소 설정 (오타 수정 완료)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function MapPage() {
    const [logs, setLogs] = useState([]);
    const seoulCityHall = [37.5665, 126.9780];

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // 공개된 로그 데이터 가져오기
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/public/logs`);
                setLogs(res.data);
            } catch (err) {
                console.error("지도 데이터 불러오기 실패:", err);
            }
        };
        fetchLogs();
    }, []);

    return (
        <div className="map-page-container">
            <h2 style={{ marginTop: 0 }}>내 라이딩 지도</h2>
            <p>공개된 모든 로그를 지도에서 확인합니다.</p>

            <div className="map-area" style={{ height: '75vh', width: '100%' }}>
                <MapContainer
                    center={seoulCityHall}
                    zoom={10}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {logs.map(log => {
                        if (!log.location || !log.location.coordinates) return null;

                        const pos = [
                            log.location.coordinates[1], // 위도
                            log.location.coordinates[0]  // 경도
                        ];
                        return (
                            <Marker key={log._id} position={pos}>
                                <Popup>
                                    <div className="map-popup-content">
                                        {log.imageUrl && (
                                            <img
                                                src={log.imageUrl}
                                                alt="log-img"
                                                width="100"
                                                style={{ display: 'block', marginBottom: '5px' }}
                                            />
                                        )}
                                        <p>{log.text}</p>
                                        <Link to={`/log/${log._id}`} className="btn-detail-link">
                                            자세히 보기
                                        </Link>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>
        </div>
    );
}