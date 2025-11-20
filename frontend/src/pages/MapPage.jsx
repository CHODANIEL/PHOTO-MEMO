// src/pages/MapPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/MapPage.scss';
import axios from 'axios'; // 👈 axios 직접 사용 (getLogs 대신)

// Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// --- 핀 이미지 경로 설정 (오타 수정됨!) ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png', // 👈 https. -> https:// 로 수정
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',         // 👈 https. -> https:// 로 수정
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

export default function MapPage() {
    const [logs, setLogs] = useState([]);
    const seoulCityHall = [37.5665, 126.9780];

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                // 👇 수정된 부분: getLogs() 대신 공개 API 주소 사용
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
                        // 위치 데이터(location)가 있는 것만 핀 찍기
                        if (!log.location || !log.location.coordinates) return null;

                        const pos = [
                            log.location.coordinates[1], // 위도
                            log.location.coordinates[0]  // 경도
                        ];
                        return (
                            <Marker key={log._id} position={pos}>
                                <Popup>
                                    <div className="map-popup-content">
                                        {/* 이미지가 있을 때만 표시 */}
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