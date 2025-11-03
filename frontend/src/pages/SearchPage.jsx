// src/pages/SearchPage.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// 👇 이 페이지 전용 SCSS
import './styles/SearchPage.scss';
// 👇 방금 추가한 'searchPublicLogs' 함수 임포트
import { searchPublicLogs } from '../api/publicService';

// (ExploreListPage의 로딩 스피너 재사용)
const LoadingSpinner = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
        검색 중입니다...
    </div>
);

export default function SearchPage() {
    const [query, setQuery] = useState('');        // 1. 검색어 (Input)
    const [results, setResults] = useState([]);      // 2. 검색 결과 (Logs)
    const [loading, setLoading] = useState(false);     // 3. 로딩 상태
    const [error, setError] = useState(null);      // 4. 에러
    // 5. 검색 실행 여부 (결과가 0개일 때와 초기 상태를 구분하기 위함)
    const [hasSearched, setHasSearched] = useState(false);

    // --- 검색 실행 함수 ---
    const handleSearch = async (e) => {
        e.preventDefault(); // (Form 태그의 기본 동작(새로고침) 방지)

        if (!query.trim()) {
            alert("검색어를 입력해주세요.");
            return;
        }

        setLoading(true);
        setError(null);
        setHasSearched(true); // "검색을 한 번이라도 실행했음"
        setResults([]); // (이전 검색 결과 비우기)

        try {
            // 👇 API 호출
            const res = await searchPublicLogs(query);
            setResults(res.data);
        } catch (err) {
            console.error("로그 검색 실패:", err);
            setError("검색 중 오류가 발생했습니다.");
        }
        setLoading(false);
    };

    // --- 검색 결과 렌더링 ---
    const renderResults = () => {
        if (loading) {
            return <LoadingSpinner />;
        }

        if (error) {
            return <div className="result-message">{error}</div>;
        }

        if (!hasSearched) {
            return <div className="result-message">검색어를 입력하고 검색하세요.</div>;
        }

        if (results.length === 0) {
            return <div className="result-message">"{query}"에 대한 검색 결과가 없습니다.</div>;
        }

        // (ExploreListPage와 동일한 카드 그리드)
        return (
            <div className="log-list-grid">
                {results.map(log => (
                    <Link to={`/log/${log._id}`} key={log._id} className="log-card-link">
                        <div className="log-card">
                            <img
                                src={log.imageUrl}
                                alt={log.text}
                                className="card-image"
                            />
                            <div className="card-content">
                                <p className="card-text">{log.text}</p>
                                <small className="card-author">
                                    by {log.user.displayName}
                                </small>
                                <small className="card-date">
                                    {new Date(log.createdAt).toLocaleDateString()}
                                </small>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    return (
        <div className="search-container">
            <h2>로그 검색</h2>
            <p>다른 유저들의 로그를 자유롭게 검색해보세요.</p>

            {/* --- 검색 폼 --- */}
            <form className="search-form" onSubmit={handleSearch}>
                <input
                    type="text"
                    className="search-input"
                    placeholder="검색어 (예: 한강, 남산) ..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
                <button
                    type="submit"
                    className="search-button"
                    disabled={loading} // 로딩 중 비활성화
                >
                    {loading ? '검색중...' : '검색'}
                </button>
            </form>

            {/* --- 검색 결과 영역 --- */}
            <div className="search-results">
                {renderResults()}
            </div>
        </div>
    );
}