// src/pages/LogListPage.jsx
// (updateLog 임포트 제거됨)
import React, { useState, useEffect } from 'react';
import LogCard from '../components/common/LogCard';
import { getLogs, deleteLog } from '../api/logService';
import './styles/LogListPage.scss';

export default function LogListPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const res = await getLogs();
                setLogs(res.data);
            } catch (err) {
                console.error("로그 목록 불러오기 실패:", err);
            }
            setLoading(false);
        };
        fetchLogs();
    }, []);

    const handleDeleteLog = async (logId) => {
        try {
            await deleteLog(logId);
            setLogs(logs.filter(log => log._id !== logId));
            alert('로그가 삭제되었습니다.');
        } catch (err) {
            alert(err.response?.data?.message || "삭제 실패");
        }
    };

    // handleEditLog 함수 전체 제거됨

    return (
        <div className="log-list-page-container">
            <h2>내 기록 목록</h2>
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
                                // onEdit prop 제거됨
                                />
                            ))
                        ) : (
                            <p>아직 작성된 로그가 없습니다.</p>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
}