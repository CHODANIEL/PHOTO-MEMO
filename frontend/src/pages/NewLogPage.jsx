import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createLog } from '../api/logService';
import './styles/NewLogPage.scss'; // (사용자 구조)

// Leaflet 라이브러리 임포트
import { MapContainer, TileLayer, Marker, useMapEvents, Popup } from 'react-leaflet';
import L from 'leaflet';

// (Leaflet 아이콘 설정)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// 맵 클릭 핸들러
function MapClickHandler({ setSelectedCoords }) {
    const map = useMapEvents({
        click(e) {
            setSelectedCoords({
                lat: e.latlng.lat,
                lng: e.latlng.lng,
            });
            map.flyTo(e.latlng, map.getZoom());
        },
    });
    return null;
}

export default function NewLogPage() {
    const navigate = useNavigate();
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [tags, setTags] = useState('');
    const [selectedCoords, setSelectedCoords] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPublic, setIsPublic] = useState(false); // '공개' 체크박스

    const seoulCityHall = [37.5665, 126.9780]; // [위도, 경도]

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || !text || !selectedCoords) {
            alert('사진, 메모, 그리고 지도 클릭(위치)은 필수입니다.');
            return;
        }
        setIsSubmitting(true);

        const formData = new FormData();
        formData.append('image', file);
        formData.append('text', text);
        formData.append('tags', tags);
        formData.append('latitude', selectedCoords.lat);
        formData.append('longitude', selectedCoords.lng);
        formData.append('isPublic', isPublic);

        try {
            await createLog(formData);
            alert('로그 작성 성공! 내 지도로 이동합니다.');
            navigate('/map');
        } catch (err) {
            alert(err.response?.data?.message || "업로드 실패");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="new-log-page-container">
            <h2>새 라이딩 로그 작성</h2>
            <p>지도에서 라이딩 위치를 클릭하세요.</p>

            {/* --- 1. 지도 렌더링 영역 --- */}
            <div className="map-area-new" style={{ height: '400px', width: '100%', marginBottom: '20px' }}>
                <MapContainer center={seoulCityHall} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler setSelectedCoords={setSelectedCoords} />
                    {selectedCoords && (
                        <Marker position={[selectedCoords.lat, selectedCoords.lng]}>
                            <Popup>이 위치로 설정</Popup>
                        </Marker>
                    )}
                </MapContainer>
            </div>

            {/* --- 2. 로그 작성 폼 --- */}
            <form onSubmit={handleSubmit} className="log-form">
                {selectedCoords && (
                    <p className="coords-info">
                        📍 위치 선택됨! (위도: {selectedCoords.lat.toFixed(4)}, 경도: {selectedCoords.lng.toFixed(4)})
                    </p>
                )}

                {/* --- 👇👇👇 사라졌던 폼 요소들입니다 --- */}
                <div className="form-group">
                    <label htmlFor="log-image">📸 사진 (필수): </label>
                    <input id="log-image" type="file" onChange={(e) => setFile(e.target.files[0])} required />
                </div>
                <div className="form-group">
                    <label htmlFor="log-text">📝 메모 (필수): </label>
                    <input id="log-text" type="text" value={text} onChange={(e) => setText(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="log-tags">🏷️ 태그 (쉼표로 구분): </label>
                    <input id="log-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="#속초,#맛집" />
                </div>
                {/* --- 👆👆👆 --- */}

                {/* --- '공개' 체크박스 --- */}
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

                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? '저장 중...' : '로그 저장하기'}
                </button>
            </form>
        </div>
    );
}

