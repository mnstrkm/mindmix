import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { games } from './registry';
import { useSavedData } from './state';
import { comparisonKey } from '../services/storage/storage';
import { GameIcon, ArrowIcon } from '../shared/ui/Icon';
export default function Records() {
  const { t } = useTranslation('common');
  const { data } = useSavedData();
  return <div>
    <div className="page-title"><p className="eyebrow">{t('brand')}</p><h1>{t('records')}</h1><p>{t('recordIntro')}</p></div>
    <div className="record-grid">{games.map(game => <section className="panel record-card" key={game.id}>
      <div className="record-heading"><span className={`game-icon ${game.tone}`}><GameIcon id={game.id} /></span><h2>{t(`${game.id}:title`)}</h2></div>
      {(game.id === 'recognition' ? ['de', 'tr'] : game.id === 'arithmetic' ? ['basic', 'mixed'] : ['default']).map(variant => {
        const key = comparisonKey({ game: game.id, variant: game.id === 'recognition' ? 'default' : variant, ruleVersion: game.ruleVersion, language: variant === 'de' || variant === 'tr' ? variant : undefined, contentVersion: game.contentVersion });
        const record = data.records.find(result => comparisonKey(result) === key);
        const label = game.id === 'recognition' ? t(variant === 'de' ? 'german' : 'turkish') : game.id === 'arithmetic' ? t(`arithmetic:variants.${variant}`) : '';
        return <div className="record-line" key={variant}>{label && <span>{label}</span>}<strong>{record ? `${record.score.toLocaleString(data.settings.language)} ${t(`${game.id}:unit`)}` : t('notPlayed')}</strong></div>;
      })}
      <Link className="text-link" to={`/game/${game.id}`}>{t('start')}<ArrowIcon /></Link>
    </section>)}</div>
    <p className="hint">{t('recordsNote')}</p>
  </div>;
}
