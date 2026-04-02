// frontend/src/pages/LogDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLogById, updateLog, toggleLikeLog } from '../api/logService';
import './styles/LogDetailPage.scss';

// Leaflet
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

// --- (핀 없음/지도 깨짐 해결) ---
import 'leaflet/dist/leaflet.css'; // (필수 CSS)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    // [수정] 'https://'가 빠져있었습니다.
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// ---

export default function LogDetailPage() {
    const { id } = useParams();
    const [log, setLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // (수정 모드 state)
    const [isEditMode, setIsEditMode] = useState(false);
    const [editedText, setEditedText] = useState('');
    const [editedTags, setEditedTags] = useState('');
    const [editedIsPublic, setEditedIsPublic] = useState(false);

    // (좋아요 state)
    const [likeCount, setLikeCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    // --- ▼▼▼ [수정] '좋아요' 알림 버그 수정 ▼▼▼ ---
    const currentUser = JSON.parse(localStorage.getItem('user'));
    // ( localStorage에 저장된 user 객체 key가 'id'가 아닌 '_id'일 수 있습니다)
    const currentUserId = currentUser ? (currentUser._id || currentUser.id) : null;
    // --- ▲▲▲ ---

    // (글 주인인지 확인)
    // [수정] log.user가 null일 경우를 대비
    const isOwner = log && currentUserId && log.user && log.user._id === currentUserId;

    useEffect(() => {
        const fetchLog = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await getLogById(id);
                const fetchedLog = res.data;

                if (fetchedLog) {
                    setLog(fetchedLog);
                    setEditedText(fetchedLog.text);
                    setEditedTags(fetchedLog.tags.join(', '));
                    setEditedIsPublic(fetchedLog.isPublic);
                    setLikeCount(fetchedLog.likes.length);
                    if (currentUserId) {
                        setIsLiked(fetchedLog.likes.includes(currentUserId));
                    }
                } else {
                    setError("로그 데이터를 찾을 수 없습니다.");
                }

            } catch (err) {
                console.error("로그 상세 정보 불러오기 실패:", err);
                setError(err.response?.data?.message || "로그를 불러올 수 없습니다.");
            }
            setLoading(false);
        };
        fetchLog();
    }, [id, currentUserId]);

    // ('수정 저장' 핸들러)
    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                text: editedText,
                tags: editedTags,
                isPublic: editedIsPublic
            };
            const res = await updateLog(id, updatedData);
            setLog(res.data);
            setIsEditMode(false);
            alert("로그가 성공적으로 수정되었습니다.");
        } catch (err) {
            console.error("로그 수정 실패:", err);
            alert(err.response?.data?.message || "수정 실패");
        }
    };

    // ('좋아요' 클릭 핸들러)
    const handleLikeClick = async () => {
        if (!currentUserId) {
            alert("로그인한 유저만 '좋아요'를 누를 수 있습니다.");
            return;
        }
        try {
            const res = await toggleLikeLog(id);
            setLikeCount(res.data.likesCount);
            setIsLiked(!isLiked);
        } catch (err) {
            console.error("좋아요 처리 실패:", err);
            alert(err.response?.data?.message || "좋아요 처리에 실패했습니다.");
        }
    };

    // --- (로딩/에러/데이터 없음 처리) ---
    if (loading) {
        return <div className="detail-container"><p>로딩 중...</p></div>;
    }
    if (error) {
        return <div className="detail-container"><p style={{ color: 'red' }}>{error}</p></div>;
    }
    if (!log) {
        return <div className="detail-container"><p>로그 정보를 찾을 수 없습니다.</p></div>;
    }
    // ---

    const position = log.location ? [
        log.location.coordinates[1], // 위도
        log.location.coordinates[0]  // 경도
    ] : null;

    return (
        <div className="log-detail-container">
            <img
                src={log.imageUrl}
                alt={log.text}
                className="detail-image"
            />

            <div className="detail-content">

                {/* '수정' 모드 (주인일 때만) */}
                {isOwner && isEditMode ? (
                    <form
                        onSubmit={handleUpdateSubmit}
                        className="edit-mode-form"
                    >
                        <h2>로그 수정</h2>
                        <div className="form-group">
                            <label htmlFor="editedText">📝 메모:</label>
                            <input
                                type="text"
                                id="editedText"
                                value={editedText}
                                onChange={(e) => setEditedText(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="editedTags">🏷️ 태그 (쉼표로 구분):</label>
                            <input
                                type="text"
                                id="editedTags"
                                value={editedTags}
                                onChange={(e) => setEditedTags(e.target.value)}
                            />
                        </div>
                        <div className="form-group-checkbox">
                            <input
                                type="checkbox"
                                id="editedIsPublic"
                                checked={editedIsPublic}
                                onChange={(e) => setEditedIsPublic(e.target.checked)}
                            />
                            <label htmlFor="editedIsPublic">
                                이 로그를 '전체 공개'합니다.
                            </label>
                        </div>
                        <div className="edit-form-actions">
                            <button
                                type="submit"
                                className="btn-primary"
                            >
                                수정 완료
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditMode(false)}
                                className="btn-cancel"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                ) : (
                    /* '보기' 모드 */
                    <>
                        <h2>{log.text}</h2>
                        <p className="detail-meta">
                            {/* [수정] log.user가 없을 경우 대비 */}
                            {log.user ? `작성자: ${log.user.displayName}` : "작성자 정보 없음"} <br />
                            작성일: {new Date(log.createdAt).toLocaleString('ko-KR')}
                        </p>

                        <div className="like-section">
                            <button
                                onClick={handleLikeClick}
                                className={`btn-like ${isLiked ? 'liked' : ''}`}
                            >
                                {isLiked ? '❤️ 좋아요 취소' : '🤍 좋아요'}
                            </button>
                            <span className="like-count">
                                {likeCount}명이 좋아합니다.
                            </span>
                        </div>

                        <div className="detail-tags">
                            {log.tags.map((tag, index) => (
                                <span key={index} className="tag">#{tag}</span>
                            ))}
                        </div>
                        <span className="public-badge-detail">
                            {log.isPublic ? "🌍 공개된 로그" : "🔒 비공개 로그"}
                        </span>

                        {/* '수정 버튼' (주인일 때만) */}
                        {isOwner && (
                            <button
                                onClick={() => setIsEditMode(true)}
                                className="btn-edit-mode"
                            >
                                [로그 수정하기]
                            </button>
                        )}
                    </>
                )}

                {/* 미니맵 */}
                {position && (
                    <div
                        className="detail-map-area"
                        style={{ height: '300px', width: '100%', marginTop: '20px' }}
                    >
                        <MapContainer
                            center={position}
                            zoom={15}
                            style={{ height: '100%', width: '100%' }}
                            scrollWheelZoom={false}
                        >
                            <TileLayer url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={position}></Marker>
                        </MapContainer>
                    </div>
                )}

                <Link to="/map" className="btn-back-to-map">
                    내 지도로 돌아가기
                </Link>
            </div>
        </div>
    );
}

