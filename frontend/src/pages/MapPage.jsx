// src/pages/MapPage.jsx (단순화 버전)

import React, { useState, useEffect } from 'react';
import './styles/MapPage.scss';
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
    // 1. 폼(Form) 관련 State 모두 제거
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    const seoulCityHall = [37.5665, 126.9780];

    // (Effect) 로그 목록 불러오기 (동일)
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

    // 2. handleSubmit(로그 생성) 핸들러 제거

    // (삭제/수정 핸들러는 동일)
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

    // 3. handleLogout 핸들러 제거 (Header.jsx로 이동)

    return (
        <div className="map-page-container">
            {/* 4. 헤더 제거 (App.jsx에서 공통으로 관리) */}

            <h2 style={{ marginTop: 0 }}>내 라이딩 지도</h2>
            <p>지금까지 기록한 나의 로그들입니다.</p>

            {/* --- 실제 지도 렌더링 영역 (핀만 표시) --- */}
            <div className="map-area" style={{ height: '400px', width: '100%', marginBottom: '20px' }}>
                <MapContainer center={seoulCityHall} zoom={10} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* 저장된 로그 목록을 마커로 표시 */}
                    {logs.map(log => {
                        if (!log.location) return null;
                        const pos = [
                            log.location.coordinates[1], // 위도
                            log.location.coordinates[0]  // 경도
                        ];
                        return (
                            <Marker key={log._id} position={pos}>
                                <Popup>
                                    <img src={log.imageUrl} alt={log.text} width="100" />
                                    <br /> {log.text}
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>
            </div>

            <hr className="divider" />

            {/* 5. 폼(Form) JSX 모두 제거 */}

            {/* --- 로그 목록 표시 --- */}
            <section className="log-list-section">
                <h2>내 기록 목록</h2>
                {loading ? (<p>기록을 불러오는 중...</p>) : (
                    <div className="log-list">
                        {logs.map(log => (
                            <LogCard
                                key={log._id}
                                log={log}
                                onDelete={handleDeleteLog}
                                onEdit={handleEditLog}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}