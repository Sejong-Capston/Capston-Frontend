// src/Tutorial.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Tutorial.css';

const tutorialSteps = [
  { icon: '🥫', title: '캔', description: '캔을 4초 돌리고 6초 밑부분을 찍어주세요.' },
  { icon: '🥛', title: '우유팩', description: '10초 동안 옆으로 돌려주세요.' },
  { icon: '🧃', title: '우유팩+빨대', description: '4초 옆으로, 6초 윗부분을 찍어주세요.' },
  { icon: '🍼', title: '플라스틱 병', description: '10초 동안 천천히 돌려주세요.' }
];

export default function Tutorial() {
  const [step, setStep] = useState(-1);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step >= tutorialSteps.length - 1) {
      navigate('/scan');
    } else {
      setStep(step + 1);
    }
  };

  const handleSkip = () => {
    navigate('/scan');
  };

  const current = step !== -1 ? tutorialSteps[step] : null;

  return (
    <div className={`tutorial-container ${step === -1 ? 'tutorial-intro' : ''}`}>
      <header className="tutorial-header">Label–Talk</header>
      <div className="tutorial-content">
        {step === -1 ? (
          <>
            <h1>Label–Talk</h1>
            <p>시각장애인을 위한 음료 정보 제공 앱입니다.</p>
            <div className="tutorial-buttons">
              <button onClick={handleSkip}>건너뛰기</button>
              <button onClick={handleNext}>다음</button>
            </div>
          </>
        ) : (
          current && (
            <>
              <div className="tutorial-icon">{current.icon}</div>
              <h2>{current.title}</h2>
              <p>{current.description}</p>
              <div className="tutorial-buttons">
                <button onClick={handleSkip}>건너뛰기</button>
                <button onClick={handleNext}>다음</button>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
}
