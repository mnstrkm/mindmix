import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useTranslation } from 'react-i18next';
import { useActivity } from '../app/state';
export function OfflineStatus() {
  const { t } = useTranslation('common');
  const { active } = useActivity();
  const [online, setOnline] = useState(navigator.onLine);
  const [error, setError] = useState(false);
  const [installed, setInstalled] = useState(false);
  const { offlineReady: [ready], needRefresh: [update], updateServiceWorker } = useRegisterSW({
    onRegisterError: () => setError(true),
  });
  useEffect(() => {
    let cancelled = false;
    if ('serviceWorker' in navigator) {
      void navigator.serviceWorker.getRegistration(import.meta.env.BASE_URL).then(registration => {
        if (!cancelled && registration?.active) setInstalled(true);
      }).catch(() => {});
    } else setError(true);
    const change = () => setOnline(navigator.onLine);
    window.addEventListener('online', change); window.addEventListener('offline', change);
    return () => { cancelled = true; window.removeEventListener('online', change); window.removeEventListener('offline', change); };
  }, []);
  return <div className="pwa-status">
    <span className="status-dot" data-ready={ready || installed} />
    <span>{!online ? t('offline') : ready || installed ? t('offlineReady') : error ? t('pwaError') : t('offlinePreparing')}</span>
    {update && <div className="update-notice" role="status">
      <span>{t('updateAvailable')} {active && t('updateAfter')}</span>
      <button className="button secondary" disabled={active} onClick={() => { void updateServiceWorker(true); }}>{t('update')}</button>
    </div>}
  </div>;
}
