import { Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import NewLogPage from "./pages/NewLogPage.jsx";
import LogDetailPage from "./pages/LogDetailPage.jsx";
import LogListPage from "./pages/LogListPage.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AdminRoute from "./components/common/AdminRoute.jsx";
import "./App.scss";

// --- ▼▼▼ [신규] 3개 페이지 임포트 ▼▼▼ ---
import ExploreMapPage from "./pages/ExploreMapPage.jsx";
import ExploreListPage from "./pages/ExploreListPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";
// --- ▲▲▲ [신규] 3개 페이지 임포트 ▲▲▲ ---

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* --- 1. 공개 페이지 --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- ▼▼▼ [신규] 3개 페이지 라우트 추가 ▼▼▼ --- */}
          <Route path="/explore-map" element={<ExploreMapPage />} />
          <Route path="/explore-logs" element={<ExploreListPage />} />
          <Route path="/search" element={<SearchPage />} />
          {/* --- ▲▲▲ [신규] 3개 페이지 라우트 추가 ▲▲▲ --- */}


          {/* --- 2. 일반유저 보호 페이지 --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/map" element={<MapPage />} />
            <Route path="/add" element={<NewLogPage />} />
            <Route path="/log/:id" element={<LogDetailPage />} />
            <Route path="/logs" element={<LogListPage />} />
          </Route>

          {/* --- 3. (신규) 관리자 보호 페이지 --- */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

        </Routes>
      </main>
    </>
  );
}