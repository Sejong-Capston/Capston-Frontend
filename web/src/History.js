//History.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Menu } from 'lucide-react';
import './History.css';

const mockData = [
  { date: '2025 / 02 / 16', name: '칠성사이다', expires: '2028 / 02 / 22' },
  { date: '2025 / 01 / 12', name: '레쓰비',      expires: '2027 / 05 / 24' },
  { date: '2024 / 12 / 23', name: '코카콜라',    expires: '2026 / 12 / 02' },
  { date: '2024 / 08 / 12', name: '삼다수',      expires: '2028 / 09 / 27' },
  { date: '2024 / 07 / 18', name: '삼양우유 IL', expires: '2024 / 07 / 21' },
];

export default function History() {
  const navigate = useNavigate();
  return (
    <div className="history-container">
      <header className="history-header">
        <button className="back-btn" onClick={() => navigate(-1)}>◀</button>
        <div className="history-header-text">
          <div className="app-title">Label–Talk</div>
          <div className="page-title">History</div>
        </div>
      </header>

      <div className="history-search">
        <button className="history-search-icon"><Menu size={20}/></button>
        <input className="history-search-input" placeholder="Search" />
        <button className="history-search-icon"><Search size={20}/></button>
      </div>

      <ul className="history-list">
        {mockData.map((item, i) => (
          <li key={i} className="history-item">
            <div className="item-line1">{item.date}  {item.name}</div>
            <div className="item-line2">유통기한 ~ {item.expires}</div>
          </li>
        ))}
      </ul>

      <button className="history-delete-all">
        스캔 기록 모두 지우기
      </button>
    </div>
  );
}
