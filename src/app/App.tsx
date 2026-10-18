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
import { UiSounds } from '../services/audio/UiSounds';
import { focusAndReveal, revealGameSelection } from '../shared/ui/viewport';
import packageInfo from '../../package.json';
function Shell() {
  const { t, i18n } = useTranslation('common');
  const { data, persistent } = useSavedData();
  const [active, setActive] = useState(false);
  const activity = useMemo(() => ({ active, setActive }), [active]);
  const location = useLocation();
  const previousNavigation = useRef(location.key);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    void i18n.changeLanguage(data.settings.language);
    document.documentElement.lang = data.settings.language;
    document.documentElement.dataset.textSize = data.settings.textSize;
    document.documentElement.dataset.theme = data.settings.theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', data.settings.theme === 'dark' ? '#10171c' : '#f6f5f0');
    audio.configure(data.settings);
  }, [data.settings, i18n]);
  useEffect(() => {
    const navigated = previousNavigation.current !== location.key;
    previousNavigation.current = location.key;
    if (location.pathname.startsWith('/game/')) return;
    const frame = requestAnimationFrame(() => {
      if (location.pathname === '/' && location.state?.scrollTarget === 'games') {
        revealGameSelection();
      } else if (location.pathname === '/') {
        if (navigated) main.current?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else if (navigated) focusAndReveal(main.current?.querySelector('h1'));
    });
    return () => cancelAnimationFrame(frame);
  }, [location.key, location.pathname, location.state]);
  useEffect(() => {
    const pauseAudio = () => { if (document.hidden) audio.pause(); };
    document.addEventListener('visibilitychange', pauseAudio);
    return () => document.removeEventListener('visibilitychange', pauseAudio);
  }, []);
  return <ActivityContext.Provider value={activity}>
    <UiSounds />
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
