// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom' // 1. BrowserRouter를 임포트
import App from './App.jsx'
import './index.scss' // (또는 App.scss 등)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. <App />을 <BrowserRouter>로 감싸줍니다. */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)