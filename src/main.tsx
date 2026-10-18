import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './styles/global.css';
import App from './app/App';
import { storage } from './services/storage/storage';
document.documentElement.dataset.theme = storage.getSnapshot().data.settings.theme;
createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
