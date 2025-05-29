// src/App.js
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Tutorial from './Tutorial';
import VideoCapture from './VideoCapture';
import Settings from './Settings';
import History from './History';
import { SettingsProvider } from './SettingsContext';  // ✅ 추가

export default function App() {
  return (
    <SettingsProvider>  {/* ✅ 앱 전체를 감쌈 */}
      <HashRouter>
        <Routes>
          <Route path="/" element={<Tutorial />} />
          <Route path="/scan" element={<VideoCapture />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </SettingsProvider>
  );
}
