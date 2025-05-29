//Settings.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from './SettingsContext';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const {
    voiceOn, setVoiceOn,
    effectsOn, setEffectsOn,
    volume, setVolume,
    autoHistory, setAutoHistory,
  } = useSettings();

  // ✅ 튜토리얼 초기화 핸들러
  const resetTutorial = () => {
    localStorage.removeItem('tutorialCompleted');
    navigate('/tutorial');
  };

  return (
    <div className="settings-container">
      <header className="settings-header">
        <button className="back-btn" onClick={() => navigate(-1)}>◀</button>
        <div className="app-title">Label–Talk</div>
        <div className="page-title">Settings</div>
      </header>

      <section className="settings-section">
        <h3>음성 안내 설정</h3>
        <div className="setting-item">
          <span>음성 안내</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={voiceOn} onChange={() => setVoiceOn(v => !v)} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <span>효과음 안내</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={effectsOn} onChange={() => setEffectsOn(e => !e)} />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item slider-item">
          <span>음성 안내 볼륨</span>
          <input
            type="range" min="0" max="100"
            value={volume}
            onChange={e => setVolume(+e.target.value)}
          />
          <span className="slider-value">{volume}%</span>
        </div>
      </section>

      <section className="settings-section">
        <h3>히스토리 설정</h3>
        <div className="setting-item">
          <span>자동 히스토리 저장</span>
          <label className="toggle-switch">
            <input type="checkbox" checked={autoHistory} onChange={() => setAutoHistory(h => !h)} />
            <span className="slider"></span>
          </label>
        </div>
      </section>

      {/* ✅ 튜토리얼 다시보기 섹션 */}
      <section className="settings-section">
        <h3>기타</h3>
        <div className="setting-item" onClick={resetTutorial} style={{ cursor: 'pointer' }}>
          <span style={{ display: 'flex', alignItems: 'center' }}>
            <img
              src="/icons/tutorial-icon.png"
              alt="튜토리얼 아이콘"
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            튜토리얼 다시보기
          </span>
        </div>
      </section>
    </div>
  );
}
