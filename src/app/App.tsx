import { useEffect, useMemo, useRef, useState } from 'react';
import { HashRouter, Link, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Home from './Home';
import Settings from './Settings';
import Records from './Records';
import GameRoute from './GameHost';
import { ActivityContext, useSavedData } from './state';
import { BrandMark } from '../shared/ui/Icon';
import { OfflineStatus } from '../pwa/OfflineStatus';
import { audio } from '../services/audio/audio';
import packageInfo from '../../package.json';
function Shell() {
  const { t, i18n } = useTranslation('common');
  const { data, persistent } = useSavedData();
  const [active, setActive] = useState(false);
  const activity = useMemo(() => ({ active, setActive }), [active]);
  const location = useLocation();
  const previousLocation = useRef(location.pathname);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    void i18n.changeLanguage(data.settings.language);
    document.documentElement.lang = data.settings.language;
    document.documentElement.dataset.textSize = data.settings.textSize;
    audio.configure(data.settings);
  }, [data.settings, i18n]);
  useEffect(() => {
    if (previousLocation.current !== location.pathname) main.current?.focus({ preventScroll: true });
    previousLocation.current = location.pathname;
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    const pauseAudio = () => { if (document.hidden) audio.pause(); };
    document.addEventListener('visibilitychange', pauseAudio);
    return () => document.removeEventListener('visibilitychange', pauseAudio);
  }, []);
  return <ActivityContext.Provider value={activity}>
    <a className="skip-link" href="#main" onClick={e => { e.preventDefault(); main.current?.focus(); }}>{t('skip')}</a>
    <header className="site-header"><div className="header-inner"><Link to="/" className="brand" aria-label={t('brand')}><BrandMark /><span>{t('brand')}</span></Link>
      <nav aria-label={t('menu')}><NavLink to="/" end>{t('games')}</NavLink><NavLink to="/records">{t('records')}</NavLink><NavLink to="/settings">{t('settings')}</NavLink></nav>
      <span className="language-badge" aria-label={t('language')}>{data.settings.language.toLocaleUpperCase(data.settings.language)}</span>
    </div></header>
    <main id="main" ref={main} tabIndex={-1} className="site-main">{!persistent && <p className="notice" role="status">{t('storageWarning')}</p>}<Routes><Route path="/" element={<Home />} /><Route path="/records" element={<Records />} /><Route path="/settings" element={<Settings />} /><Route path="/game/:id" element={<GameRoute />} /><Route path="*" element={<Home />} /></Routes></main>
    <footer className="site-footer"><div><strong>{t('footer')}</strong><p>{t('localOnly')}</p></div><div className="footer-status"><OfflineStatus /><span>{t('version', { version: packageInfo.version })}</span></div></footer>
  </ActivityContext.Provider>;
}
export default function App() { return <HashRouter><Shell /></HashRouter>; }
