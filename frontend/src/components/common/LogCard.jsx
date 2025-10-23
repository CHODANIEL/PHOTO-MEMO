// src/components/common/LogCard.jsx

import React from 'react';

// 부모(MapPage)로부터 log 객체와 삭제/수정 함수를 props로 받음
export default function LogCard({ log, onDelete, onEdit }) {

    // 삭제 버튼 클릭 시
    const handleDeleteClick = () => {
        // (중요) 그냥 삭제하면 위험하므로, 확인 창을 띄웁니다.
        if (window.confirm("정말로 이 로그를 삭제하시겠습니까? S3에서도 삭제됩니다.")) {
            onDelete(log._id); // 부모의 onDelete 함수 호출
        }
    };

    // 수정 버튼 클릭 시 (간단하게 text만 수정)
    const handleEditClick = () => {
        const newText = window.prompt("새 메모를 입력하세요:", log.text);

        // 사용자가 취소를 누르지 않았고, 텍스트가 비어있지 않다면
        if (newText && newText.trim() !== "") {
            // (참고) 실제로는 텍스트뿐만 아니라 location, tags도 수정 모달을 띄워야 함
            onEdit(log._id, { text: newText }); // 부모의 onEdit 함수 호출
        }
    };

    return (
        <div className="log-card">
            <img src={log.imageUrl} alt={log.text} className="log-card-image" />
            <div className="log-card-content">
                <p className="log-card-text">{log.text}</p>
                <p className="log-card-location">{log.location}</p>
                <p className="log-card-tags">{log.tags.join(' ')}</p>
                <small className="log-card-date">
                    {new Date(log.createdAt).toLocaleString('ko-KR')}
                </small>
            </div>

            {/* --- 수정/삭제 버튼 추가 --- */}
            <div className="log-card-actions">
                <button onClick={handleEditClick} className="btn-edit">수정</button>
                <button onClick={handleDeleteClick} className="btn-delete">삭제</button>
            </div>
        </div>
    );
}