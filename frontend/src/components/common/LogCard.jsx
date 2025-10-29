// src/components/common/LogCard.jsx

import React from 'react';
import { Link } from 'react-router-dom'; // 👈 1. <Link> 임포트
import './styles/LogCard.scss'; // 👈 2. (선택) LogCard.scss를 만드셨다면 임포트

export default function LogCard({ log, onDelete, onEdit }) {

    const handleDeleteClick = () => {
        if (window.confirm("정말로 이 로그를 삭제하시겠습니까? S3에서도 삭제됩니다.")) {
            onDelete(log._id); 
        }
    };

    const handleEditClick = () => {
        
        const newText = window.prompt("새 메모를 입력하세요:", log.text);
        if (newText && newText.trim() !== "") {
            // (임시) 현재는 텍스트만 수정 요청
            onEdit(log._id, { text: newText });
        }
    };

    return (
        <div className="log-card">
            
            {/* 이미지 클릭 시 상세 페이지로 이동 */}
            <Link to={`/log/${log._id}`}>
                <img src={log.imageUrl} alt={log.text} className="log-card-image" />
            </Link>

            <div className="log-card-content">
                
                {/* 텍스트 클릭 시 상세 페이지로 이동 */}
                <Link to={`/log/${log._id}`} className="log-card-title-link">
                    <p className="log-card-text">{log.text}</p>
                </Link>

                {/* 좌표 텍스트 렌더링 (이전 단계에서 수정됨) */}
                {log.location ? (
                    <p className="log-card-location">
                        📍 위도: {log.location.coordinates[1].toFixed(4)}, 
                        경도: {log.location.coordinates[0].toFixed(4)}
                    </p>
                ) : (
                    <p className="log-card-location">📍 위치 정보 없음</p>
                )}

                <p className="log-card-tags">{log.tags.join(' ')}</p>
                <small className="log-card-date">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                </small>
            </div>
            
            <div className="log-card-actions">
                <button onClick={handleEditClick} className="btn-edit">메모 수정</button>
                <button onClick={handleDeleteClick} className="btn-delete">삭제</button>
            </div>
        </div>
    );
}