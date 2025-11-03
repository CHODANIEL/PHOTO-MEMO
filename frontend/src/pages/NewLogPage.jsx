// src/pages/NewLogPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLog } from '../api/logService';
import './styles/NewLogPage.scss';

// Leaflet
// 👇 1. 'useMapEvents'를 임포트합니다. (클릭 감지용)
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// --- 👇👇👇 '핀 없음' 문제 해결 (필수!) ---
// (MapPage.jsx, LogDetailPage.jsx와 동일한 아이콘 경로 수정 코드)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// --- 👆👆👆 ---


// --- (신규) '지도 클릭'을 감지하는 컴포넌트 ---
function MapClickHandler({ setSelectedCoords }) {
    const map = useMapEvents({
        // 지도를 클릭했을 때
        click(e) {
            // 1. 클릭한 위치의 좌표(lat, lng)를 state에 저장
            setSelectedCoords({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
            });
            // 2. (선택) 클릭한 곳으로 지도 이동
            map.flyTo(e.latlng, map.getZoom());
        },
    });
    return null; // (이 컴포넌트는 UI가 없습니다)
}
// --- 👆 ---


export default function NewLogPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [tags, setTags] = useState('');
    const [isPublic, setIsPublic] = useState(false);

    // (State를 'markerPosition' -> 'selectedCoords' (객체)로 변경)
    const [selectedCoords, setSelectedCoords] = useState(null); // (초기값 null)
    const [isSubmitting, setIsSubmitting] = useState(false);

    const seoulCityHall = [37.5665, 126.9780]; // [위도, 경도]

    // (폼 제출 핸들러)
    const handleSubmit = async (e) => {
        e.preventDefault();

        // (유효성 검사: selectedCoords가 null인지 확인)
        if (!file || !text || !selectedCoords) {
            alert('사진, 메모, 그리고 지도 클릭(위치)은 필수입니다.');
            return;
        }
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('text', text);
        formData.append('tags', tags);
        formData.append('isPublic', isPublic);
        // (selectedCoords 객체에서 lat, lng 전송)
        formData.append('latitude', selectedCoords.lat);
        formData.append('longitude', selectedCoords.lng);

        try {
            await createLog(formData);
            alert('새 로그가 성공적으로 저장되었습니다!');
            navigate('/map'); // 저장 후 지도 페이지로 이동
        } catch (err) {
            console.error("로그 저장 실패:", err);
            alert(err.response?.data?.message || "로그 저장에 실패했습니다.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="new-log-page-container">
            <h2>새 라이딩 로그 작성</h2>
            <p>지도에서 라이딩 위치를 클릭하세요.</p>

            {/* --- 1. 지도 렌더링 영역 --- */}
            <div className="map-area-new" style={{ height: '400px', width: '100%', marginBottom: '20px' }}>
                <MapContainer
                    center={seoulCityHall} // (초기 중심은 서울)
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* (신규) 지도 클릭 핸들러 삽입 */}
                    <MapClickHandler setSelectedCoords={setSelectedCoords} />

                    {/* (신규) 선택한 위치에만 마커 표시 */}
                    {selectedCoords && (
                        <Marker position={[selectedCoords.lat, selectedCoords.lng]}>
                            <Popup>이 위치로 설정</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {/* --- 2. 로그 작성 폼 --- */}
            <form onSubmit={handleSubmit} className="log-form">

                {/* (신규) 좌표 확인 텍스트 */}
                {selectedCoords ? (
                    <p className="coords-info">
                        📍 위치 선택됨! (위도: {selectedCoords.lat.toFixed(4)}, 경도: {selectedCoords.lng.toFixed(4)})
                    </p>
                ) : (
                    <p className="coords-info-blank">
                        (지도를 클릭해서 위치를 선택해주세요)
                    </p>
                )}

                <div className="form-group">
                    <label htmlFor="log-image">📸 사진 (필수): </label>
                    <input
                        id="log-image"
                        type="file"
                        onChange={(e) => setFile(e.target.files[0])}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="log-text">📝 메모 (필수): </label>
                    <textarea
                        id="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="오늘의 라이딩에 대해 기록해주세요..."
                        rows="4"
                        required
                    ></textarea>
                </div>
                <div className="form-group">
                    <label htmlFor="log-tags">🏷️ 태그 (쉼표로 구분):</label>
                    <input
                        type="text"
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="#서울 #남산 #야간라이딩"
                    />
                </div>
                <div className="form-group-checkbox">
                    <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                    />
                    <label htmlFor="isPublic">
                        이 로그를 '전체 공개'합니다.
                    </label>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? '저장 중...' : '로그 저장하기'}
                </button>
            </form>
        </div>
    );
}