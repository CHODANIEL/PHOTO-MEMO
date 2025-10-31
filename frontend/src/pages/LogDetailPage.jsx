// src/pages/LogDetailPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
// (addComment, deleteComment는 '내일'을 위해 일단 둡니다)
import { getLogById, updateLog, toggleLikeLog, addComment, deleteComment } from '../api/logService';
import './styles/LogDetailPage.scss';

// Leaflet
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet'; // 👈 1. L 임포트

// --- 👇👇👇 '핀 없음' 및 '지도 깨짐' 해결 (필수!) ---
// (MapPage.jsx와 동일한 아이콘 경로 수정 코드)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https.unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});
// --- 👆👆👆 ---


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

    // (댓글 state)
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [isCommenting, setIsCommenting] = useState(false);

    // (로그인 유저 ID)
    const currentUser = JSON.parse(localStorage.getItem('user'));
    const currentUserId = currentUser ? currentUser.id : null;

    useEffect(() => {
        const fetchLog = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await getLogById(id);
                const fetchedLog = res.data;

                if (fetchedLog) {
                    setLog(fetchedLog);
                    // 폼 state 초기화
                    setEditedText(fetchedLog.text);
                    setEditedTags(fetchedLog.tags.join(', '));
                    setEditedIsPublic(fetchedLog.isPublic);
                    // '좋아요' state 초기화
                    setLikeCount(fetchedLog.likes.length);
                    // '댓글' state 초기화
                    setComments(fetchedLog.comments);

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

    // ('댓글 작성' 핸들러)
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) {
            alert("댓글 내용을 입력하세요.");
            return;
        }
        setIsCommenting(true);
        try {
            const res = await addComment(id, newComment);
            setComments([...comments, res.data]);
            setNewComment('');
        } catch (err) {
            console.error("댓글 작성 실패:", err);
            alert(err.response?.data?.message || "댓글 작성에 실패했습니다.");
        }
        setIsCommenting(false);
    };

    // ('댓글 삭제' 핸들러)
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
            return;
        }
        try {
            await deleteComment(id, commentId);
            setComments(comments.filter(comment => comment._id !== commentId));
            alert("댓글이 삭제되었습니다.");
        } catch (err) {
            console.error("댓글 삭제 실패:", err);
            alert(err.response?.data?.message || "댓글 삭제에 실패했습니다.");
        }
    };

    // (데이터 로딩 전 렌더링 방지)
    if (loading) {
        return <div className="detail-container"><p>로딩 중...</p></div>;
    }
    if (error) {
        return <div className="detail-container"><p style={{ color: 'red' }}>{error}</p></div>;
    }
    if (!log) {
        return <div className="detail-container"><p>로그 정보를 찾을 수 없습니다.</p></div>;
    }

    // (log가 있다는 것이 확인된 후에만 position 계산)
    const position = log.location ? [
        log.location.coordinates[1], // 위도
        log.location.coordinates[0]  // 경도
    ] : null;

    // --- 실제 렌더링 ---
    return (
        <div className="log-detail-container">
            <img
                src={log.imageUrl}
                alt={log.text}
                className="detail-image"
            />

            <div className="detail-content">

                {/* --- '보기' 모드 --- */}
                {!isEditMode ? (
                    <>
                        <h2>{log.text}</h2>
                        <p className="detail-meta">
                            작성자: {log.user.displayName} <br />
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

                        <button
                            onClick={() => setIsEditMode(true)}
                            className="btn-edit-mode"
                        >
                            [로그 수정하기]
                        </button>
                    </>
                ) : (
                    /* --- '수정' 모드 (폼) --- */
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
                )}

                {/* --- 미니맵 --- */}
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
                            <TileLayer url="https.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <Marker position={position}></Marker>
                        </MapContainer>
                    </div>
                )}

                <Link to="/map" className="btn-back-to-map">
                    내 지도로 돌아가기
                </Link>

                {/* --- 댓글 섹션 (내일 수정) --- */}
                <hr className="divider" />
                <section className="comment-section">
                    <h3>댓글 ({comments.length}개)</h3>
                    <form
                        onSubmit={handleCommentSubmit}
                        className="comment-form"
                    >
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={currentUserId ? "댓글을 입력하세요..." : "로그인 후 댓글을 작성할 수 있습니다."}
                            disabled={!currentUserId || isCommenting}
                        />
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={!currentUserId || isCommenting}
                        >
                            {isCommenting ? "등록 중..." : "댓글 등록"}
                        </button>
                    </form>

                    <div className="comment-list">
                        {comments.length > 0 ? (
                            comments.map(comment => (
                                <div key={comment._id} className="comment-item">
                                    <div className="comment-header">
                                        <span className="comment-author">
                                            {comment.user.displayName}
                                        </span>
                                        <span className="comment-date">
                                            {new Date(comment.createdAt).toLocaleString('ko-KR')}
                                        </span>
                                    </div>
                                    <p className="comment-text">{comment.text}</p>
                                    {(currentUserId === comment.user._id || (log && currentUserId === log.user._id)) && (
                                        <button
                                            onClick={() => handleDeleteComment(comment._id)}
                                            className="btn-comment-delete"
                                        >
                                            삭제
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>아직 댓글이 없습니다.</p>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}