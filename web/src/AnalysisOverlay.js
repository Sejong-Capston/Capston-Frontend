// src/AnalysisOverlay.js
import React from 'react';
import { RefreshCw, Mic, MicOff } from 'lucide-react';
import './AnalysisOverlay.css';

export default function AnalysisOverlay({
  result,
  ttsOn,
  onRetry,
  onToggleTts,
  onClose
}) {
  const { productName, expiryDate, ingredients } = result;
  const isFailed = !productName && !expiryDate;

  return (
    <div className="ao-backdrop">
      <div className="ao-box">
        {!isFailed && (
          <button className="ao-close-btn" onClick={onClose}>×</button>
        )}

        {isFailed ? (
          <>
            <h2 className="ao-title">인식 실패</h2>
            <p>제품 정보를 인식하지 못했습니다</p>
          </>
        ) : (
          <>
            <h2 className="ao-title">{productName || '제품명 없음'}</h2>
            <p>유통기한: {expiryDate || '없음'}</p>

            {ingredients && ingredients.length > 0 && (
              <div className="ao-ingredients">
                <p>성분:</p>
                <ul>
                  {ingredients.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <div className="ao-actions">
          <button onClick={onRetry} title="다시 읽기">
            <RefreshCw size={20} />
          </button>
          <button onClick={onToggleTts} title="음소거 토글">
            {ttsOn ? <Mic size={20} /> : <MicOff size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}
