// src/App.jsx

import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx"; // 1. 임포트
import MapPage from "./pages/MapPage.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import "./App.scss";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} /> {/* 2. 경로 추가 */}

      <Route element={<ProtectedRoute />}>
        <Route path="/map" element={<MapPage />} />
      </Route>
    </Routes>
  );
}