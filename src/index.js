import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import VideoCapture  from './VideoCapture';
import ScanAnalysis  from './ScanAnalysis';
import Settings      from './Settings';
import History       from './History';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
   


      {/* 스캔 촬영 화면 */}
      <Route path="/scan"       element={<VideoCapture />} />

      {/* 스캔 후 분석 화면 */}
      <Route path="/analysis"   element={<ScanAnalysis />} />

      {/* 설정 / 히스토리 */}
      <Route path="/settings"   element={<Settings />} />
      <Route path="/history"    element={<History />} />

    
    </Routes>
  </BrowserRouter>
);

