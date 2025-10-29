// src/pages/LogListPage.jsx

import React, { useState, useEffect } from 'react';
import LogCard from '../components/common/LogCard';
import { getLogs, deleteLog, updateLog } from '../api/logService';
import './styles/LogListPage.scss'; // 👈 1. SCSS 파일 임포트

export default function LogListPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    // (추후 페이지네이션을 위한 State)
    // const [currentPage, setCurrentPage] = useState(1);
    // const [totalPages, setTotalPages] = useState(1);

    // (Effect) 로그 목록 불러오기
    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                // (참고) 나중에 페이지네이션 구현 시: await getLogs(currentPage);
                const res = await getLogs();
                setLogs(res.data);
                // setTotalPages(res.data.totalPages);
            } catch (err) {
                console.error("로그 목록 불러오기 실패:", err);
            }
            setLoading(false);
        };
        fetchLogs();
    }, []); // (나중에 [currentPage] 추가)

    // (삭제/수정 핸들러는 MapPage와 동일)
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
        <div className="log-list-page-container">
            <h2>전체 기록 목록</h2>
            <p>내가 작성한 모든 로그를 확인합니다.</p>

            <section className="log-list-section">
                {loading ? (
                    <p>기록을 불러오는 중...</p>
                ) : (
                    <div className="log-list">
                        {logs.length > 0 ? (
                            logs.map(log => (
                                <LogCard
                                    key={log._id}
                                    log={log}
                                    onDelete={handleDeleteLog}
                                    onEdit={handleEditLog}
                                />
                            ))
                        ) : (
                            <p>아직 작성된 로그가 없습니다.</p>
                        )}
                    </div>
                )}
            </section>

            {/* (추후 페이지네이션 UI가 들어갈 자리) */}
            {/* <div className="pagination-controls"> ... </div> */}
        </div>
    );
}