import React from 'react';
import { Link } from 'react-router-dom';
import './styles/LogCard.scss'; // (사용자 구조)

// 1. onEdit prop을 받지 않음
export default function LogCard({ log, onDelete }) {

    const handleDeleteClick = () => {
        // (onDelete가 없을 때(예: LandingPage)는 실행 안 함)
        if (onDelete && window.confirm("정말로 이 로그를 삭제하시겠습니까? S3에서도 삭제됩니다.")) {
            onDelete(log._id);
        }
    };

    // 2. handleEditClick 함수 전체 제거
    /*
    const handleEditClick = () => { ... };
    */

    return (
        <div className="log-card">

            <Link to={`/log/${log._id}`}>
                <img src={log.imageUrl} alt={log.text} className="log-card-image" />
                {log.isPublic && (
                    <span className="public-badge">🌍 공개</span>
                )}
            </Link>

            <div className="log-card-content">
                <Link to={`/log/${log._id}`} className="log-card-title-link">
                    <p className="log-card-text">{log.text}</p>
                </Link>

                {log.location ? (
                    <p className="log-card-location">
                        📍 {log.location.coordinates[1].toFixed(4)}, {log.location.coordinates[0].toFixed(4)}
                    </p>
                ) : (
                    <p className="log-card-location">📍 위치 정보 없음</p>
                )}

                <p className="log-card-tags">{log.tags.join(' ')}</p>
                <small className="log-card-date">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                </small>
            </div>

            {/* 3. onDelete prop이 있을 때만 삭제 버튼 표시 */}
            {onDelete && (
                <div className="log-card-actions">
                    {/* [메모 수정] 버튼 제거됨 */}
                    <button onClick={handleDeleteClick} className="btn-delete">삭제</button>
                </div>
            )}
        </div>
    );
}

