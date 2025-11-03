// src/main.jsx

import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.scss'

// (지도 CSS는 index.html에서 로드하므로, 여기서는 임포트하지 않습니다.)

ReactDOM.createRoot(document.getElementById('root')).render(
  // (StrictMode는 지도와 충돌할 수 있으니 제거)
  <BrowserRouter>
    <App />
  </BrowserRouter>
)