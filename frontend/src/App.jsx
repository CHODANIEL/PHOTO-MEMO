// src/App.jsx

import { Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import NewLogPage from "./pages/NewLogPage.jsx";
import LogDetailPage from "./pages/LogDetailPage.jsx";
import LogListPage from "./pages/LogListPage.jsx"; // 👈 1. 임포트
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import AdminRoute from "./components/common/AdminRoute.jsx";
import "./App.scss";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* ... (공개 페이지) ... */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- 일반유저 보호 페이지 --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/map" element={<MapPage />} />
            <Route path="/add" element={<NewLogPage />} />
            <Route path="/log/:id" element={<LogDetailPage />} />
            <Route path="/logs" element={<LogListPage />} /> {/* 👈 2. 라우트 추가 */}
          </Route>

          {/* --- 관리자 보호 페이지 --- */}
          <Route element={<AdminRoute />}>
            {/* <Route path="/admin" element={<AdminDashboard />} /> */}
          </Route>

        </Routes>
      </main>
    </>
  );
}