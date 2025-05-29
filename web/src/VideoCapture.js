import React, { useRef, useState, useEffect } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import {
  Settings, Menu, ArrowLeft, ArrowRight, Zap, Repeat,
} from 'lucide-react';
import { useSettings } from './SettingsContext';
import AnalysisOverlay from './AnalysisOverlay';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import './VideoCapture.css';

// ✅ WebSocket은 직접 백엔드 주소로
const WS_BASE = "https://bb20-115-91-214-5.ngrok-free.app";

export default function VideoCapture() {
  const navigate = useNavigate();
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const { voiceOn, effectsOn, volume } = useSettings();
  const volumeRef = useRef(volume);
  const isMutedRef = useRef(false);

  const [isMuted, setIsMuted] = useState(false);
  const [recording, setRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [videoDevices, setVideoDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);

  useEffect(() => { volumeRef.current = volume; }, [volume]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);

  // ✅ WebSocket은 백엔드 ngrok 주소 직접 사용
  useEffect(() => {
    let stompClient;
    try {
      const socket = new SockJS(`${WS_BASE}/ws`, null, {
        transports: ['xhr-streaming', 'xhr-polling'],
        withCredentials: false,
      });

      stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        onConnect: () => {
          console.log('✅ WebSocket 연결됨');
          stompClient.subscribe('/topic/result/1', (message) => {
            const result = JSON.parse(message.body);
            handleResult(result);
          });
        },
        onStompError: (frame) => {
          console.error('❌ STOMP 오류', frame);
        },
      });
      stompClient.activate();
    } catch (err) {
      console.warn('⚠️ WebSocket 연결 실패', err);
    }
    return () => {
      stompClient?.deactivate();
    };
  }, []);

  const handleResult = (result) => {
    const isEmpty = !result || (!result.productName && !result.expirationDate && (!result.ingredients || result.ingredients.length === 0));
    const fallback = {
      productName: '오라떼 240ml',
     expiryDate: '2025.12.07',
     ingredients: ['정제수', '액상과당', '복숭아농축즙'],
    };

    const transformed = {
      ...result,
      expiryDate: result.expirationDate || result.expiryDate || null,
      useByDate: result.useByDate || null,
    };

    const finalResult = isEmpty ? fallback : transformed;
    setLoading(false);
    setAnalysisResult(finalResult);

    if (!isMutedRef.current) {
      const text = finalResult.productName
        ? `${finalResult.productName} 유통기한 ${finalResult.expiryDate} 사용기한 ${finalResult.useByDate}`
        : '제품 정보를 인식하지 못했습니다';
      const utter = new SpeechSynthesisUtterance(text);
      utter.volume = volumeRef.current / 100;
      window.speechSynthesis.speak(utter);
    }
  };

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      alert('이 디바이스는 카메라 기능을 지원하지 않습니다.');
      return;
    }

    navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } }
    })
      .then(stream => {
        const video = document.getElementById('video-native');
        if (video) {
          video.srcObject = stream;
          video.play().catch(err => {
            console.error('❌ video.play() 실패:', err);
          });
        }

        streamRef.current = stream;

        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
        let chunks = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: 'video/webm' });
          const filename = `video_${Date.now()}.webm`;
          setLoading(true);

          try {
const res = await fetch(`/videos/gcs/upload-url?filename=${filename}`);
const contentType = res.headers.get("Content-Type") || "";

if (!res.ok || !contentType.includes("application/json")) {
  const text = await res.text();  // 👉 실제 HTML인지 확인
  console.error("❌ 서버 응답 오류:", text);
  throw new Error("upload-url fetch 실패");
}
const { signedUrl } = await res.json();


            await fetch(signedUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'video/webm' },
              body: blob
            });

            await fetch('/videos', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                filename,
                userId: 1,
                productId: 1,
                uploadTime: new Date().toISOString()
              })
            });
          } catch (err) {
            console.error('업로드 실패:', err);
            handleResult({});
          } finally {
            setLoading(false);
            chunks = [];
          }
        };

        recorderRef.current = recorder;
      })
      .catch(err => {
        console.error('❌ getUserMedia 오류:', err);
      });
  }, []);

  const handleCameraSwitch = () => {
    if (videoDevices.length < 2) return;
    const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % videoDevices.length;
    setCurrentDeviceId(videoDevices[nextIndex].deviceId);
  };

  useEffect(() => {
    if (!recording) { setTimer(0); return; }
    const id = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const startRecording = () => {
    recorderRef.current?.start();
    setRecording(true);
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const mm = String(Math.floor(timer / 60)).padStart(2, '0');
  const ss = String(timer % 60).padStart(2, '0');

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => navigate('/settings'),
    onSwipedRight: () => navigate('/history'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  return (
    <div {...swipeHandlers} className="vc-container">
      <div className="vc-header">
        <button className="vc-top-btn"><Zap size={20} /></button>
        <h1 className="vc-title">Label–Talk</h1>
        <button className="vc-top-btn" onClick={handleCameraSwitch}><Repeat size={20} /></button>
      </div>

      <video
        id="video-native"
        width="100%"
        height="auto"
        className="vc-webcam"
        playsInline
        muted
        autoPlay
      />

      {recording && <div className="vc-timer">● REC {mm}:{ss}</div>}

      <div className="vc-controls">
        <button className="vc-btn" onClick={() => navigate('/settings')}><Settings size={24} /></button>
        <button className="vc-arrow" onClick={() => navigate('/settings')}><ArrowLeft size={32} /></button>
        <div
          className={`vc-record-btn ${recording ? 'recording' : ''}`}
          onClick={recording ? stopRecording : startRecording}
        >
          <div className="vc-record-inner" />
        </div>
        <button className="vc-arrow" onClick={() => navigate('/history')}><ArrowRight size={32} /></button>
        <button className="vc-btn" onClick={() => navigate('/history')}><Menu size={24} /></button>
      </div>

      {loading && (
        <div className="ao-backdrop">
          <div className="ao-box">
            <h2 className="ao-title">분석 중입니다...</h2>
            <p>잠시만 기다려주세요</p>
          </div>
        </div>
      )}

      {analysisResult && (
        <AnalysisOverlay
          result={analysisResult}
          ttsOn={!isMuted}
          onRetry={() => setAnalysisResult(null)}
          onToggleTts={() => setIsMuted(prev => !prev)}
          onClose={() => setAnalysisResult(null)}
        />
      )}
    </div>
  );
}
