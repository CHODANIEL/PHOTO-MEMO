// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import "../styles/LandingPage.scss"; // 스타일 적용 (선택)

export default function Landing() {
    return (
        <section className="landing">
            <div className="container">
                <div className="landing-hero">
                    {/* H1: 사이트 제목 변경 */}
                    <h1>라이딩 로그</h1> 
                    
                    {/* P: 사이트 부제 변경 (핵심 기능 강조) */}
                    <p className="landing-sub">나만의 바이크 여정. 사진, 메모, 그리고 지도 위 핀.</p>
                    
                    <Link to="/login" className="btn btn-primary">
                        {/* 버튼 텍스트 변경 */}
                        로그 시작하기 
                    </Link>
                </div>

                <ul className="landing-features">
                    {/* 기능 1: 컨셉에 맞게 수정 */}
                    <li>
                        <h3>간편한 기록</h3>
                        <p>사진과 간단한 메모로 오늘의 라이딩을 저장하세요.</p>
                    </li>
                    {/* 기능 2: 컨셉에 맞게 수정 */}
                    <li>
                        <h3>태그 & 검색</h3>
                        <p>#지역 #맛집 #기종 태그로 원하는 기록을 바로 찾기.</p>
                    </li>
                    {/* 기능 3: '지도' 핵심 기능으로 변경 */}
                    <li>
                        <h3>나만의 라이딩 맵</h3>
                        <p>내가 다녀온 모든 곳이 지도 위에 핀으로 표시됩니다.</p>
                    </li>
                </ul>
            </div>
        </section>
    );
}