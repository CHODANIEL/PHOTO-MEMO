// src/pages/MapPage.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './styles/MapPage.scss'; // 👈 1. 여기가 수정되었습니다! (./styles/로 변경)
import LogCard from '../components/common/LogCard';
import { getLogs, deleteLog, updateLog } from '../api/logService';

// Leaflet 라이브러리 임포트
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// (Leaflet 아이콘 설정 ...)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


export default function MapPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const seoulCityHall = [37.5665, 126.9780];

    // (Effect) 로그 목록 불러오기
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await getLogs();
                setLogs(res.data);
            } catch (err) { console.error("로그 목록 불러오기 실패:", err); }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    // (삭제/수정 핸들러)
    const handleDeleteLog = async (logId) => {
        try {
            await deleteLog(logId);
            setLogs(logs.filter(log => log._id !== logId));
            alert('로그가 삭제되었습니다.');
        } catch (err) {
            alert(err.response?.data?.message || "삭제 실패");
        }
    };
    const handleEditLog = async (logId, updatedData) => {
        try {
            const res = await updateLog(logId, updatedData);
            setLogs(logs.map(log =>
                log._id === logId ? res.data : log
            ));
            alert('로그가 수정되었습니다.');
        } catch (err) {
            alert(err.response?.data?.message || "수정 실패");
        }
    };

    return (
        <div className="map-page-container">
            <h2 style={{ marginTop: 0 }}>내 라이딩 지도</h2>
            <p>지금까지 기록한 나의 로그들입니다.</p>

            {/* --- 실제 지도 렌더링 영역 --- */}
            <div className="map-area" style={{ height: '400px', width: '100%', marginBottom: '20px' }}>
                <MapContainer center={seoulCityHall} zoom={10} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

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
                                        <img src={log.imageUrl} alt={log.text} width="100" />
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

            <hr className="divider" />

        </div>
    );
}