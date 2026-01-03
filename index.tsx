
import React from 'react';
import ReactDOM from 'react-dom/client';
// Polyfill process for browser environments to prevent "process is not defined" errors
(window as any).process = (window as any).process || { env: {} };

import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
