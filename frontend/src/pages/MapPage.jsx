// src/pages/MapPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/MapPage.scss';
import LogCard from '../components/common/LogCard'; // 👈 1. LogCard 임포트

// (axios 인스턴스 설정)
const api = axios.create({
    baseURL: 'http://localhost:3000/api',
    withCredentials: true
});

export default function MapPage() {
    const navigate = useNavigate();

    // --- State (동일) ---
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [location, setLocation] = useState('');
    const [tags, setTags] = useState('');
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- (Effect) 로그 목록 불러오기 (동일) ---
    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get('/logs'); 
                setLogs(res.data); 
                setLoading(false);
            } catch (err) {
                console.error("로그 목록 불러오기 실패:", err);
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    // --- 폼 제출 (로그 생성) 핸들러 (동일) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        // ... (FormData 생성 및 API 호출 로직은 동일)
        const formData = new FormData();
        formData.append('image', file);
        formData.append('text', text);
        formData.append('location', location);
        formData.append('tags', tags);

        try {
            const res = await api.post('/logs', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            alert('로그 작성 성공!');
            setLogs([res.data, ...logs]); // 새 로그 목록에 추가
            e.target.reset(); // 폼 리셋
            setFile(null); setText(''); setLocation(''); setTags('');
        } catch (err) {
            alert(err.response?.data?.message || "업로드 실패");
        }
    };
    
    // --- (신규) 로그 삭제 핸들러 ---
    const handleDeleteLog = async (logId) => {
        try {
            // 백엔드 DELETE /api/logs/:id 호출
            await api.delete(`/logs/${logId}`);
            
            // 삭제 성공 시, 프론트엔드 state에서도 해당 로그를 제거
            setLogs(logs.filter(log => log._id !== logId));
            alert('로그가 삭제되었습니다.');

        } catch (err) {
            console.error("로그 삭제 실패:", err);
            alert(err.response?.data?.message || "삭제 실패");
        }
    };

    // --- (신규) 로그 수정 핸들러 ---
    // (LogCard에서 newText 객체 { text: "새 메모" } 를 받음)
    const handleEditLog = async (logId, updatedData) => {
        try {
            // 백엔드 PUT /api/logs/:id 호출
            const res = await api.put(`/logs/${logId}`, updatedData);
            
            // 수정 성공 시, 프론트엔드 state도 업데이트
            setLogs(logs.map(log => 
                log._id === logId ? res.data : log // 기존 로그를 새 로그(res.data)로 교체
            ));
            alert('로그가 수정되었습니다.');

        } catch (err) {
            console.error("로그 수정 실패:", err);
            alert(err.response?.data?.message || "수정 실패");
        }
    };


    // --- 로그아웃 핸들러 (동일) ---
    const handleLogout = async () => {
        try {
            await api.post('/users/logout');
            localStorage.removeItem('user');
            navigate('/login');
        } catch (err) {
            console.error("로그아웃 실패:", err);
        }
    };

    // --- JSX ---
    return (
        <div className="map-page-container">
            <header className="map-page-header">
                <h1>나의 라이딩 맵 🏍️</h1>
                <button onClick={handleLogout} className="btn-logout">로그아웃</button>
            </header>

            <hr className="divider" />

            {/* --- 로그 작성 폼 (동일) --- */}
            <form onSubmit={handleSubmit} className="log-form">
                {/* ... (폼 내용은 동일) ... */}
                <h3>새 라이딩 로그 작성</h3>
                <div className="form-group">
                    <label htmlFor="log-image">📸 사진 (필수): </label>
                    <input id="log-image" type="file" onChange={(e) => setFile(e.target.files[0])} required />
                </div>
                <div className="form-group">
                    <label htmlFor="log-text">📝 메모 (필수): </label>
                    <input id="log-text" type="text" value={text} onChange={(e) => setText(e.target.value)} required />
                </div>
                <div className="form-group">
                    <label htmlFor="log-location">📍 위치: </label>
                    <input id="log-location" type="text" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="log-tags">🏷️ 태그 (쉼표로 구분): </label>
                    <input id="log-tags" type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="#속초,#맛집" />
                </div>
                <button type="submit" className="btn btn-primary">로그 저장하기</button>
            </form>

            <hr className="divider" />

            {/* --- 로그 목록 표시 (LogCard 사용) --- */}
            <section className="log-list-section">
                <h2>내 기록 목록</h2>
                {loading ? ( <p>기록을 불러오는 중...</p> ) : (
                    <div className="log-list">
                        {/* 👇 2. logs.map() 부분을 LogCard 컴포넌트로 교체 */}
                        {logs.map(log => (
                            <LogCard 
                                key={log._id} 
                                log={log} 
                                onDelete={handleDeleteLog} // 👈 3. 삭제 함수 전달
                                onEdit={handleEditLog}     // 👈 4. 수정 함수 전달
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}