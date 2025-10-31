// src/pages/MapPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/MapPage.scss';
import LogCard from '../components/common/LogCard';
import { getLogs, deleteLog } from '../api/logService';

// Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
// (MarkerClusterGroup 임포트 삭제됨)


// --- 👇👇👇 '핀 없음' 문제 해결 (아이콘 경로 수동 설정) ---
// (이 코드가 없으면 핀(Marker)이 보이지 않습니다)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https.unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https.unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// --- 👆👆👆 ---


export default function MapPage() {
    const [logs, setLogs] = useState([]);
    const seoulCityHall = [37.5665, 126.9780];

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await getLogs();
                setLogs(res.data);
            } catch (err) {
                console.error("로그 목록 불러오기 실패:", err);
            }
        };
        fetchLogs();
    }, []);

    // (handleDeleteLog 함수는 목록이 제거되며 함께 제거됨)

    return (
        <div className="map-page-container">
            <h2 style={{ marginTop: 0 }}>내 라이딩 지도</h2>
            <p>지금까지 기록한 나의 로그들입니다.</p>

            {/* --- 지도 영역 --- */}
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

                    {/* (MarkerClusterGroup 제거됨) */}
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
                </MapContainer>
            </div>
            {/* (로그 목록 섹션은 제거됨) */}
        </div>
    );
}