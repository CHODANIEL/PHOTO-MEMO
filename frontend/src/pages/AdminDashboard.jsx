// src/pages/AdminDashboard.jsx

import React, { useState, useEffect } from 'react';
import { getAllUsers, getAllLogs, updateUserRole } from '../api/adminService';
import './styles/AdminDashboard.scss'; // 👈 1. SCSS 파일 임포트

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // 1. 데이터 로드 Hook
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                // 2. API 2개 동시 호출
                const [usersRes, logsRes] = await Promise.all([
                    getAllUsers(),
                    getAllLogs()
                ]);
                setUsers(usersRes.data);
                setLogs(logsRes.data);
                setError(null);
            } catch (err) {
                console.error("관리자 데이터 로드 실패:", err);
                setError("데이터를 불러오는 중 오류가 발생했습니다.");
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    // 2. 유저 역할 변경 핸들러
    const handleRoleChange = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const confirmMsg = `[${userId}] 유저의 역할을 '${newRole}'(으)로 변경하시겠습니까?`;
        
        if (!window.confirm(confirmMsg)) {
            return;
        }

        try {
            const updatedUser = await updateUserRole(userId, newRole);
            
            // 3. 프론트엔드 state도 실시간 업데이트
            setUsers(users.map(user => 
                user._id === userId ? updatedUser.data : user
            ));
            alert("역할이 성공적으로 변경되었습니다.");
        } catch (err) {
            console.error("역할 변경 실패:", err);
            alert(err.response?.data?.message || "역할 변경에 실패했습니다.");
        }
    };

    if (loading) return <div className="admin-container"><p>관리자 데이터 로딩 중...</p></div>;
    if (error) return <div className="admin-container"><p style={{ color: 'red' }}>{error}</p></div>;

    return (
        <div className="admin-container">
            <h1>관리자 대시보드</h1>
            <p>총 {users.length}명의 유저와 {logs.length}개의 로그가 있습니다.</p>

            <hr className="divider" />

            {/* --- 1. 유저 관리 섹션 --- */}
            <section className="admin-section">
                <h2>유저 관리</h2>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>이름 (displayName)</th>
                            <th>이메일</th>
                            <th>역할 (Role)</th>
                            <th>가입일</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.displayName}</td>
                                <td>{user.email}</td>
                                <td className={`role-${user.role}`}>{user.role}</td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button 
                                        onClick={() => handleRoleChange(user._id, user.role)}
                                        className="btn-role-toggle"
                                    >
                                        {user.role === 'admin' ? '유저로 강등' : '관리자로 승격'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <hr className="divider" />

            {/* --- 2. 로그 관리 섹션 --- */}
            <section className="admin-section">
                <h2>전체 로그 관리</h2>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>작성자</th>
                            <th>메모 (Text)</th>
                            <th>이미지</th>
                            <th>작성일</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log._id}>
                                <td>{log.user?.displayName || '알 수 없음'}</td>
                                <td>{log.text}</td>
                                <td>
                                    <a href={log.imageUrl} target="_blank" rel="noopener noreferrer">
                                        [이미지 보기]
                                    </a>
                                </td>
                                <td>{new Date(log.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <button className="btn-delete-admin">
                                        (로그 강제 삭제)
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}