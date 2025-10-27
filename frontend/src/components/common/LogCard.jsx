// src/components/common/LogCard.jsx

import React from 'react';

// 부모(MapPage)로부터 log 객체와 삭제/수정 함수를 props로 받음
export default function LogCard({ log, onDelete, onEdit }) {

    // 삭제 버튼 클릭 시
    const handleDeleteClick = () => {
        if (window.confirm("정말로 이 로그를 삭제하시겠습니까? S3에서도 삭제됩니다.")) {
            onDelete(log._id); 
        }
    };

    // 수정 버튼 클릭 시
    const handleEditClick = () => {
        // (참고) 이제 DB 스키마가 좌표로 바뀌었으므로,
        //      단순 텍스트 수정이 아닌 '지도에서 다시 클릭'하는 로직이 필요합니다.
        //      지금은 간단히 텍스트만 수정하도록 둡니다.
        const newText = window.prompt("새 메모를 입력하세요:", log.text);
        
        if (newText && newText.trim() !== "") {
            onEdit(log._id, { text: newText }); // 부모의 onEdit 함수 호출
        }
    };

    return (
        <div className="log-card">
            <img src={log.imageUrl} alt={log.text} className="log-card-image" />
            <div className="log-card-content">
                <p className="log-card-text">{log.text}</p>
                
                {/* 👇👇👇 여기가 수정되었습니다! 👇👇👇 */}
                {/* log.location이 객체이므로, 안의 coordinates를 꺼냅니다. */}
                {log.location ? (
                    <p className="log-card-location">
                        📍 위도: {log.location.coordinates[1].toFixed(4)}, 
                        경도: {log.location.coordinates[0].toFixed(4)}
                    </p>
                ) : (
                    <p className="log-card-location">📍 위치 정보 없음</p>
                )}
                {/* --- 👆👆👆 --- */}

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