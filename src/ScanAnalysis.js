import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { RotateCw, Volume2, VolumeX } from 'lucide-react';
import './ScanAnalysis.css';

export default function ScanAnalysis() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { videoUrl, result } = state || {};
  const [muted, setMuted] = useState(false);

  // 예시: result = { name, expires, ingredients }
  useEffect(() => {
    if (!result) {
      // result가 없으면 스캔 화면으로 복귀
      navigate('/scan');
    }
  }, [result, navigate]);

  const toggleMute = () => setMuted(m => !m);

  return (
    <div className="analysis-container">
      <header className="analysis-header">
        <button className="nav-btn" onClick={() => navigate(-1)}>◀</button>
        <h1 className="title">분석 결과</h1>
      </header>

      <div className="analysis-content">
        <video
          className="analysis-video"
          src={videoUrl}
          controls
          muted={muted}
        />

        <div className="result-box">
          <div className="result-line">
            <span className="label">음료명:</span>
            <span className="value">{result?.name}</span>
          </div>
          <div className="result-line">
            <span className="label">유통기한:</span>
            <span className="value">{result?.expires}</span>
          </div>
          <div className="result-line">
            <span className="label">성분:</span>
            <span className="value">{result?.ingredients.join(', ')}</span>
          </div>
        </div>

        <div className="analysis-actions">
          <button onClick={toggleMute} className="action-btn">
            {muted ? <VolumeX size={24}/> : <Volume2 size={24}/>}
          </button>
          <button onClick={() => navigate('/history')} className="action-btn">
            기록 보기
          </button>
          <button onClick={() => navigate('/scan')} className="action-btn">
            다시 스캔
          </button>
        </div>
      </div>
    </div>
  );
}
