// src/VideoCapture.js
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { Download, RotateCw, Mic, MicOff } from 'lucide-react';
import './VideoCapture.css';

const AI_BASE =
  process.env.REACT_APP_AI_BASE_URL ||
  'http://localhost:5000';
const UPLOAD_BASE =
  process.env.REACT_APP_API_BASE_URL ||
  'http://localhost:3003';

export default function VideoCapture() {
  const navigate = useNavigate();

  // 토글 상태
  const [isMuted, setIsMuted] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const toggleMute   = () => setIsMuted(m => !m);
  const toggleRotate = () => setIsRotated(r => !r);

  // 녹화 refs & state
  const webcamRef   = useRef(null);
  const recorderRef = useRef(null);
  const [recording,  setRecording ] = useState(false);
  const [chunks,     setChunks    ] = useState([]);
  const [timer,      setTimer     ] = useState(0);
  const [status,     setStatus    ] = useState('');
  const [uploadedUrl,setUploadedUrl] = useState('');

  // 스와이프 핸들러 (좌우 스와이프 → 설정/히스토리)
  const goToSettings = () => navigate('/settings');
  const goToHistory  = () => navigate('/history');
  const swipeHandlers = useSwipeable({
    onSwipedLeft:  goToSettings,
    onSwipedRight: goToHistory,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  // MediaRecorder 초기화
  const handleUserMedia = useCallback(stream => {
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = e => {
      if (e.data.size > 0) setChunks(c => [...c, e.data]);
    };
    recorderRef.current = recorder;
  }, []);

  // 녹화 타이머: recording만 의존
  useEffect(() => {
    if (!recording) {
      setTimer(0);
      return;
    }
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => {
      clearInterval(id);
      setTimer(0);
    };
  }, [recording]);

  const startRecording = () => {
    setChunks([]);
    recorderRef.current?.start();
    setRecording(true);
    setStatus('');
    setUploadedUrl('');
  };

  const stopRecording = useCallback(() => {
    if (!recorderRef.current) return;
    recorderRef.current.stop();
    setRecording(false);
    setStatus('⏳ 업로드 준비 중...');
    setTimeout(async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      try {
        setStatus('☁️ 스토리지 업로드 중...');
        const form = new FormData();
        const filename = `video_${Date.now()}.webm`;
        form.append('file', blob, filename);
  
        // ✅ 절대경로로 호출
const uploadRes = await fetch(
'http://127.0.0.1:3003/upload',  // ← IPv4 루프백 주소로 변경
{ method: 'POST', body: form }
);
  
        if (!uploadRes.ok) {
          const text = await uploadRes.text();
          throw new Error(`업로드 실패 ${uploadRes.status}: ${text}`);
        }
  
        const { publicUrl } = await uploadRes.json();
        setUploadedUrl(publicUrl);
        setStatus('✅ URL 생성됨');
  
        setStatus('🧠 AI 분석 중...');
        const { data: result } = await axios.post(
          `${AI_BASE}/analyze`,
          { videoUrl: publicUrl }
        );
  
        navigate('/analysis', { state: { videoUrl: publicUrl, result } });
      } catch (err) {
        console.error('[VideoCapture] 업로드/분석 에러:', err);
        setStatus(`❌ ${err.message}`);
      }
    }, 500);
  }, [chunks, navigate]);
  

  const downloadRecording = () => {
    if (!chunks.length) return;
    const blob = new Blob(chunks, { type: 'video/webm' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `recording_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    document.body.removeChild(a);
  };

  // 타이머 포맷
  const mm = String(Math.floor(timer / 60)).padStart(2, '0');
  const ss = String(timer % 60).padStart(2, '0');

  return (
    <div {...swipeHandlers} className="vc-container">
      <Webcam
        audio={!isMuted}
        ref={webcamRef}
        onUserMedia={handleUserMedia}
        screenshotFormat="video/webm"
        className={`vc-webcam ${isRotated ? 'rotated' : ''}`}
      />

      {/* 정보 오버레이 */}
      <div className="vc-info-overlay">
        <div className="vc-info-text">
          제품명: xxx<br/>
          유통기한: YYYY.MM.DD<br/>
          사용기한: ZZZZ.MM.DD
        </div>
        <div className="vc-info-controls">
          <button onClick={toggleRotate}><RotateCw size={24} /></button>
          <button onClick={toggleMute}>
            {isMuted ? <MicOff size={24}/> : <Mic size={24}/>}
          </button>
        </div>
      </div>

      {/* 헤더 */}
      <div className="vc-header">
        <h1 className="vc-title">Echo of Sip</h1>
        {recording && <div className="vc-timer">● REC {mm}:{ss}</div>}
      </div>

      {/* 하단 컨트롤 */}
      <div className="vc-controls">
        <button className="vc-btn vc-settings" onClick={goToSettings}>⚙️</button>
        <button
          className="vc-record"
          onClick={recording ? stopRecording : startRecording}
        />
        <button className="vc-btn vc-menu" onClick={goToHistory}>☰</button>
        {!recording && chunks.length > 0 && (
          <button className="vc-btn vc-download" onClick={downloadRecording}>
            <Download size={24}/>
          </button>
        )}
      </div>

      {/* 업로드된 URL 표시 */}
      {uploadedUrl && (
        <div className="vc-status">
          ✅ 업로드 URL:&nbsp;
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer">
            {uploadedUrl}
          </a>
        </div>
      )}

      {/* 상태 메시지 */}
      {status && <div className="vc-status">{status}</div>}
    </div>
  );
}
