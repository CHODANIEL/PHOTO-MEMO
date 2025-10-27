// src/App.jsx

import { Routes, Route } from "react-router-dom";
import Header from "./components/common/Header";
import HomePage from "./pages/HomePage.jsx"; // 👈 1. HomePage 임포트
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import MapPage from "./pages/MapPage.jsx";
import NewLogPage from "./pages/NewLogPage.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import "./App.scss";

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Routes>
          {/* --- 1. 공개 페이지 --- */}
          {/* 👇 2. 여기가 수정되었습니다! */}
          <Route path="/" element={<HomePage />} />

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* --- 2. 보호된 페이지 (로그인한 유저만) --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/map" element={<MapPage />} />
            <Route path="/add" element={<NewLogPage />} />
          </Route>
        </Routes>
      </main>
    </>
  );
}