// src/VideoCapture.js
import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import './VideoCapture.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL;

export default function VideoCapture() {
  const webcamRef   = useRef(null);
  const recorderRef = useRef(null);
  const [recording, setRecording] = useState(false);
  const [chunks,     setChunks    ] = useState([]);
  const [timer,      setTimer     ] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [status,     setStatus    ] = useState('');

  // 스트림 준비되면 호출 → MediaRecorder 초기화
  const handleUserMedia = useCallback(stream => {
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    recorder.ondataavailable = e => {
      if (e.data.size > 0) setChunks(c => [...c, e.data]);
    };
    recorderRef.current = recorder;
  }, []);

  // 녹화 타이머
  useEffect(() => {
    if (recording) {
      const id = setInterval(() => setTimer(t => t + 1), 1000);
      setIntervalId(id);
    } else {
      clearInterval(intervalId);
      setTimer(0);
    }
    return () => clearInterval(intervalId);
  }, [recording]);

  // 녹화 시작
  const startRecording = () => {
    setChunks([]);
    if (recorderRef.current) {
      recorderRef.current.start();
      setRecording(true);
      setStatus('');
    }
  };

  // 녹화 중지 및 업로드
  const stopRecording = useCallback(() => {
    if (!recorderRef.current) return;
    recorderRef.current.stop();
    setRecording(false);
    setStatus('⏳ 업로드 준비 중...');
    setTimeout(async () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      try {
        setStatus('☁️ GCS 업로드 중...');
        const videoUrl = await uploadToGCS(blob);
        setStatus('✅ GCS 업로드 완료!');
        await axios.post(`${API_BASE}/videos`, { videoUrl });
        setStatus('✅ 백엔드 저장 완료');
      } catch {
        setStatus('❌ 업로드 실패');
      }
    }, 500);
  }, [chunks]);

  // 서명 URL 받아 PUT → publicUrl 리턴
  async function uploadToGCS(blob) {
    const filename    = `video_${Date.now()}.webm`;
    const contentType = blob.type;
    const { uploadUrl, publicUrl } = (await axios.post(
      `${API_BASE}/storage/upload-url`,
      { filename, contentType }
    )).data;

    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': contentType },
      body: blob,
    });

    return publicUrl;
  }

  // 녹화 파일 다운로드 (임시 확인용)
  const downloadRecording = () => {
    if (chunks.length === 0) return;
    const blob = new Blob(chunks, { type: 'video/webm' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.style.display = 'none';
    a.href        = url;
    a.download    = `recording_${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  // 타이머 mm:ss
  const mm = String(Math.floor(timer / 60)).padStart(2, '0');
  const ss = String(timer % 60).padStart(2, '0');

  return (
    <div className="vc-container">
      <Webcam
        audio
        ref={webcamRef}
        onUserMedia={handleUserMedia}
        screenshotFormat="image/webm"
        className="vc-webcam"
      />

      <div className="vc-header">
        <button className="vc-btn vc-flash">⚡</button>
        <h1 className="vc-title">Echo of Sip</h1>
        {recording && <div className="vc-timer">● REC {mm}:{ss}</div>}
      </div>

      <div className="vc-controls">
        <button className="vc-btn vc-settings">⚙</button>
        <button className="vc-btn vc-nav">◀</button>
        {recording ? (
          <button className="vc-record vc-stop" onClick={stopRecording} />
        ) : (
          <button className="vc-record vc-start" onClick={startRecording} />
        )}
        <button className="vc-btn vc-nav">▶</button>
        <button className="vc-btn vc-menu">☰</button>
        {!recording && chunks.length > 0 && (
          <button className="vc-btn vc-download" onClick={downloadRecording}>
            ⬇️ 다운로드
          </button>
        )}
      </div>

      {status && <div className="vc-status">{status}</div>}
    </div>
  );
}
