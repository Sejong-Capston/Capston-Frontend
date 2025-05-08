import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// public/index.html 파일 내에 <div id="root"></div>가 있어야 합니다.
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
