import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { games, getRuleVersion } from './registry';
import { useSavedData } from './state';
import { comparisonKey } from '../services/storage/storage';
import { GameIcon, ArrowIcon } from '../shared/ui/Icon';
import type { Language } from './types';
export default function Records() {
  const { t } = useTranslation('common');
  const { data } = useSavedData();
  return <div>
    <div className="page-title"><p className="eyebrow">{t('brand')}</p><h1>{t('records')}</h1><p>{t('recordIntro')}</p></div>
    <div className="record-grid">{games.map(game => <section className="panel record-card" key={game.id}>
      <div className="record-heading"><span className={`game-icon ${game.tone}`}><GameIcon id={game.id} /></span><h2>{t(`${game.id}:title`)}</h2></div>
      {(game.id === 'recognition' ? ['de', 'tr'] : game.id === 'arithmetic' ? ['basic', 'mixed'] : ['default']).map(variant => {
        const meta = { game: game.id, variant: game.id === 'recognition' ? 'default' : variant, ruleVersion: getRuleVersion(game, variant), language: (variant === 'de' || variant === 'tr' ? variant : undefined) as Language | undefined, contentVersion: game.contentVersion };
        const key = comparisonKey(meta);
        const record = data.records.find(result => comparisonKey(result) === key);
        const label = game.id === 'recognition' ? t(variant === 'de' ? 'german' : 'turkish') : game.id === 'arithmetic' ? t(`arithmetic:variants.${variant}`) : '';
        return <div key={variant} className="record-group"><div className="record-line"><span>{label || t(`${game.id}:recordLabel`, { defaultValue: t('personalBest') })}</span><strong>{record ? `${record.score.toLocaleString(data.settings.language)} ${t(`${game.id}:unit`)}` : t('notPlayed')}</strong></div>
          {game.recordMetrics?.map(metric => { const best = data.records.find(item => comparisonKey(item) === comparisonKey({ ...meta, metric })); return <div className="record-line" key={metric}><span>{t(`${game.id}:records.${metric}`)}</span><strong>{best ? `${best.score.toLocaleString(data.settings.language)} ${t(`${game.id}:unit`)}` : t('notPlayed')}</strong></div>; })}
        </div>;
      })}
      <Link className="text-link" to={`/game/${game.id}`}>{t('start')}<ArrowIcon /></Link>
    </section>)}</div>
    <p className="hint records-note">{t('recordsNote')}</p>
  </div>;
}
