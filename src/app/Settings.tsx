import { useTranslation } from 'react-i18next';
import { useSavedData } from './state';
import { storage, type Settings as SettingsType } from '../services/storage/storage';
import { audio } from '../services/audio/audio';
import { audioConfig } from '../services/audio/config';
export default function Settings() {
  const { t } = useTranslation('common');
  const { data: { settings } } = useSavedData();
  const set = (patch: Partial<SettingsType>) => { storage.setSettings(patch); audio.configure({ ...settings, ...patch }); audio.unlock(); };
  return <div className="page-narrow">
    <div className="page-title"><p className="eyebrow">{t('brand')}</p><h1>{t('settings')}</h1><p>{t('tagline')}</p></div>
    <section className="panel settings-section"><h2>{t('language')}</h2><p>{t('languageDescription')}</p>
      <div className="segmented" role="group" aria-label={t('language')}>
        <button lang="de" aria-pressed={settings.language === 'de'} onClick={() => set({ language: 'de' })}>{t('german')}</button>
        <button lang="tr" aria-pressed={settings.language === 'tr'} onClick={() => set({ language: 'tr' })}>{t('turkish')}</button>
      </div>
    </section>
    <section className="panel settings-section"><h2>{t('textSize')}</h2><p>{t('textDescription')}</p>
      <div className="segmented" role="group" aria-label={t('textSize')}>
        {(['normal', 'large', 'extra'] as const).map(size => <button key={size} aria-pressed={settings.textSize === size} onClick={() => set({ textSize: size })}>{t(size)}</button>)}
      </div>
    </section>
    <section className="panel settings-section"><h2>{t('sound')}</h2><p>{t('soundDescription')}</p>
      <label className="toggle-row"><span>{t('effects')}</span><input type="checkbox" checked={settings.effects} onChange={e => set({ effects: e.target.checked })} /></label>
      <label className="range-row"><span>{t('effectVolume')} <output>{Math.round(settings.effectVolume * 100)}%</output></span><input type="range" min="0" max="1" step="0.05" value={settings.effectVolume} onChange={e => set({ effectVolume: Number(e.target.value) })} /></label>
      <label className="toggle-row"><span>{t('music')}</span><input type="checkbox" checked={settings.music} disabled={!audioConfig.music} onChange={e => set({ music: e.target.checked })} /></label>
      {!audioConfig.music && <p className="hint">{t('musicUnavailable')}</p>}
      <label className="range-row"><span>{t('musicVolume')} <output>{Math.round(settings.musicVolume * 100)}%</output></span><input type="range" min="0" max="1" step="0.05" value={settings.musicVolume} onChange={e => set({ musicVolume: Number(e.target.value) })} /></label>
    </section>
    <section className="panel information"><h2>{t('deviceStorage')}</h2><p>{t('storageDescription')}</p><p>{t('pwaHelp')}</p><p className="hint">{t('accessibilityNote')}</p></section>
  </div>;
}
