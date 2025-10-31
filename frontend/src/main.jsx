// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.scss'

// --- 👇👇👇 Leaflet 기본 CSS (이것 *한 줄*만 남깁니다) ---
import 'leaflet/dist/leaflet.css';

// (에러가 나는 MarkerCluster CSS 2줄은 삭제했습니다)

ReactDOM.createRoot(document.getElementById('root')).render(
  // (StrictMode는 지도와 충돌할 수 있으니 제거)
  <BrowserRouter>
    <App />
  </BrowserRouter>
)