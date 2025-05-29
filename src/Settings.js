// src/Settings.js
import React, { useState } from 'react';
import './Settings.css';

export default function Settings() {
  const [voiceOn, setVoiceOn]                   = useState(true);
  const [effectsOn, setEffectsOn]               = useState(false);
  const [ignoreMute, setIgnoreMute]             = useState(true);
  const [volume, setVolume]                     = useState(53);
  const [autoHistory, setAutoHistory]           = useState(true);
  const [notifyOn, setNotifyOn]                 = useState(true);
  const [ignoreHistoryMute, setIgnoreHistoryMute] = useState(true);

  return (
    <div className="settings-container">
      <header className="settings-header">
        <button className="back-btn" onClick={() => window.history.back()}>◀</button>
        <div className="app-title">Echo of Sip</div>
        <div className="page-title">Settings</div>
      </header>

      <section className="settings-section">
        <h3>음성 안내 설정</h3>
        <div className="setting-item">
          <span>음성 안내</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={voiceOn}
              onChange={() => setVoiceOn(v => !v)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <span>효과음 안내</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={effectsOn}
              onChange={() => setEffectsOn(e => !e)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <span>무음 모드 무시</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={ignoreMute}
              onChange={() => setIgnoreMute(m => !m)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item slider-item">
          <span>음성 안내 볼륨</span>
          <input
            type="range"
            min="0"
            max="100"
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
            <input
              type="checkbox"
              checked={autoHistory}
              onChange={() => setAutoHistory(h => !h)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <span>히스토리 알림음</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={notifyOn}
              onChange={() => setNotifyOn(n => !n)}
            />
            <span className="slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <span>무음 모드 무시</span>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={ignoreHistoryMute}
              onChange={() => setIgnoreHistoryMute(m => !m)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </section>
    </div>
  );
}
