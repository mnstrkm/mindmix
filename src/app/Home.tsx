import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { games } from './registry';
import { GameIcon, ArrowIcon } from '../shared/ui/Icon';
import { useSavedData } from './state';
import { comparisonKey } from '../services/storage/storage';

export default function Home() {
  const { t } = useTranslation('common');
  const { data } = useSavedData();
  return <>
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow"><span className="tiny-spark">✦</span> {t('eyebrow')}</p>
        <h1>{t('heroFirst')}<br /><span>{t('heroSecond')}</span></h1>
        <p className="hero-description">{t('heroDescription')}</p>
        <a className="button primary hero-button" href="#game-list" onClick={event => { event.preventDefault(); document.getElementById('game-list')?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); document.getElementById('game-list')?.focus({ preventScroll: true }); }}>{t('explore')}<ArrowIcon /></a>
        <p className="hero-note">{t('heroNote')}</p>
      </div>
      <div className="hero-art" aria-hidden="true">
        <div className="art-orbit" />
        <div className="art-tile art-one sage"><GameIcon id="spatial" /></div>
        <div className="art-tile art-two peach"><GameIcon id="simon" /></div>
        <div className="art-tile art-three lavender"><GameIcon id="digits" /></div>
        <div className="art-tile art-four yellow"><GameIcon id="reaction" /></div>
        <span className="art-spark">✳</span><span className="art-dot" />
      </div>
    </section>
    <section className="catalog" aria-labelledby="game-list">
      <div className="section-heading"><div><p className="eyebrow">{t('games')}</p><h2 id="game-list" tabIndex={-1}>{t('allGames')}</h2></div><p>{t('allGamesDescription')}</p></div>
      <div className="game-cards">
        {games.map((game, index) => {
          const record = data.records.find(item => comparisonKey(item) === comparisonKey({ game: game.id, variant: game.id === 'arithmetic' ? 'basic' : 'default', ruleVersion: game.ruleVersion, language: game.id === 'recognition' ? data.settings.language : undefined, contentVersion: game.contentVersion }));
          return <Link className={`game-card ${game.tone}`} to={`/game/${game.id}`} key={game.id} aria-label={t('openGame', { game: t(`${game.id}:title`) })}>
            <div className="card-top"><span className="game-icon"><GameIcon id={game.id} /></span><span className="card-number">{String(index + 1).padStart(2, '0')}</span></div>
            <p className="card-category">{t(`category.${game.id}`)}</p>
            <h3>{t(`${game.id}:title`)}</h3><p className="card-description">{t(`${game.id}:description`)}</p>
            <div className="card-bottom"><span>{record ? `${record.score.toLocaleString(data.settings.language)} ${t(`${game.id}:unit`)}` : t(game.id === 'reaction' ? 'measured' : 'untimed')}</span><span className="card-arrow"><ArrowIcon /></span></div>
          </Link>;
        })}
      </div>
    </section>
  </>;
}
