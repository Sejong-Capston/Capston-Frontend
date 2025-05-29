// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import VideoCapture from './VideoCapture';
import Settings     from './Settings';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 루트로 들어오면 항상 메인 녹화 화면 */}
        <Route path="/" element={<VideoCapture />} />

        {/* 설정 화면 */}
        <Route path="/settings" element={<Settings />} />


        {/* 그 외 경로도 전부 메인으로 */}
        <Route path="*" element={<VideoCapture />} />
      </Routes>
    </BrowserRouter>
  );
}
