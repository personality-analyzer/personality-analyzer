import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './store/AppContext.jsx';
import { checkForUpdatesOnStartup } from './services/updater.js';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);

// فحص التحديث عند بدء التشغيل (محمي داخلياً؛ لا يعمل إلا داخل تطبيق Tauri).
checkForUpdatesOnStartup();
