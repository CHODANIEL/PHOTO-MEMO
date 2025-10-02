// src/App.jsx
import { Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.jsx";
import './App.scss'
import Authpanel from './components/Authpanel.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path='/admin/login' element={<Authpanel />} />
    </Routes>
  );
}