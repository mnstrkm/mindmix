import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getGame, getRuleVersion } from './registry';
import type { GameResult, Language } from './types';
import { useActivity, useSavedData } from './state';
import { comparisonKey, isBetter, storage, type Result } from '../services/storage/storage';
import { audio } from '../services/audio/audio';
import { GameIcon } from '../shared/ui/Icon';
import { ErrorBoundary } from '../shared/ui/ErrorBoundary';
import { revealRegion } from '../shared/ui/viewport';

function ReadyContent({ onReady, children }: { onReady: () => void; children: ReactNode }) {
  useEffect(onReady, [onReady]);
  return children;
}

function Instructions({ id }: { id: string }) {
  const { t } = useTranslation('common');
  const Guide = getGame(id)?.guide;
  return <div className="instructions">{Guide && <Guide />}{['goal', 'controls', 'ending', 'scoring'].map(key => <div key={key}><h3>{t(key)}</h3><p>{t(`${id}:${key}`)}</p></div>)}</div>;
}
export default function GameRoute() {
  const { id } = useParams();
  return <GameHost key={id} id={id} />;
}
function GameHost({ id }: { id?: string }) {
  const { t } = useTranslation('common');
  const game = getGame(id);
  const { data } = useSavedData();
  const { setActive } = useActivity();
  const [phase, setPhase] = useState<'prepare' | 'playing' | 'result'>('prepare');
  const [variant, setVariant] = useState(game?.id === 'arithmetic' ? 'basic' : 'default');
  const [language, setLanguage] = useState<Language>(data.settings.language);
  const [round, setRound] = useState(0);
  const [pause, setPause] = useState<'help' | 'background' | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [progress, setProgress] = useState<GameResult>({ score: 0, actions: 0 });
  const [result, setResult] = useState<GameResult | null>(null);
  const [newBest, setNewBest] = useState(false);
  const [previousBest, setPreviousBest] = useState<number | null>(null);
  const session = useRef<{ id: string; done: boolean; meta: Omit<Result, keyof GameResult | 'id' | 'date'>; progress: GameResult } | null>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const pauseTitle = useRef<HTMLHeadingElement>(null);
  const gameArea = useRef<HTMLDivElement>(null);
  const page = useRef<HTMLDivElement>(null);
  const wasPaused = useRef(false);
  const finish = useCallback((value: GameResult, show = true) => {
    const current = session.current;
    if (!current || current.done) return;
    current.done = true;
    const { review: _review, ...persisted } = value;
    const saved: Result = { ...persisted, ...current.meta, id: current.id, date: new Date().toISOString() };
    const previous = storage.getSnapshot().data.records.find(item => comparisonKey(item) === comparisonKey(saved));
    const best = value.actions > 0 && value.eligible !== false && value.score > 0 && isBetter(saved, previous);
    storage.finalize(saved);
    audio.pause({ preserveUi: !show });
    if (show) {
      setResult(value); setPhase('result'); setPause(null); setNewBest(best); setPreviousBest(best && previous ? previous.score : null);
    }
    setActive(false);
  }, [setActive]);
  const onFinish = useCallback((value: GameResult) => finish(value), [finish]);
  const onProgress = useCallback((value: GameResult) => {
    if (!session.current || session.current.done) return;
    session.current.progress = value;
    setProgress(value);
  }, []);
  useEffect(() => () => {
    const current = session.current;
    if (current && !current.done) finish({ ...current.progress, reason: 'stopped' }, false);
    audio.pause({ preserveUi: true });
  }, [finish]);
  useEffect(() => {
    const interrupt = () => {
      if (session.current && !session.current.done) { setPause('background'); audio.pause(); }
    };
    const visibility = () => { if (document.hidden) interrupt(); };
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('pagehide', interrupt);
    return () => { document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', interrupt); };
  }, []);
  useEffect(() => { title.current?.focus({ preventScroll: true }); }, [phase]);
  // Child cleanup stops sequence audio first; only then start the result cue.
  useEffect(() => {
    if (phase === 'result' && result) audio.play(result.reason === 'mistake' || result.reason === 'false-starts' ? 'error' : newBest ? 'record' : 'click');
  }, [phase, result, newBest]);
  useEffect(() => { if (pause) pauseTitle.current?.focus({ preventScroll: true }); }, [pause]);
  useEffect(() => {
    if (wasPaused.current && !pause && phase === 'playing') gameArea.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus({ preventScroll: true });
    wasPaused.current = Boolean(pause);
  }, [pause, phase]);
  const positionContent = useCallback(() => {
    const region = page.current?.querySelector<HTMLElement>(pause ? '.pause-panel' : phase === 'prepare' ? '.preparation' : phase === 'playing' ? '.play-panel' : '.result-panel');
    revealRegion(region, page.current?.querySelector('.game-title'));
  }, [phase, pause]);
  useEffect(() => {
    if (phase === 'playing') return;
    const frame = requestAnimationFrame(positionContent);
    return () => cancelAnimationFrame(frame);
  }, [phase, positionContent]);
  if (!game) return <div className="panel"><h1>{t('notFound')}</h1><Link to="/">{t('menu')}</Link></div>;
  const meta = { game: game.id, variant, ruleVersion: getRuleVersion(game, variant), language: game.id === 'recognition' ? phase === 'prepare' ? data.settings.language : language : undefined, contentVersion: game.contentVersion };
  const key = comparisonKey(meta);
  const record = data.records.find(item => comparisonKey(item) === key);
  const history = data.history.filter(item => comparisonKey(item) === key).slice(-5).reverse();
  const start = () => {
    audio.unlock();
    const initial = { score: 0, actions: 0, eligible: game.id !== 'reaction' };
    session.current = { id: crypto.randomUUID(), done: false, meta: { ...meta, language: game.id === 'recognition' ? data.settings.language : undefined }, progress: initial };
    setLanguage(data.settings.language); setResult(null); setNewBest(false); setProgress(initial); setPause(null); setRound(value => value + 1); setPhase('playing'); setActive(true);
  };
  const Game = game.component;
  const number = (value: number) => value.toLocaleString(data.settings.language, { maximumFractionDigits: 1 });
  return <div className="page-game" ref={page}>
    <Link className="text-link back-link" to="/">← {t('back')}</Link>
    <div className="game-title"><span className={`game-icon ${game.tone}`}><GameIcon id={game.id} /></span><div><p className="eyebrow">{t(`category.${game.id}`)}</p><h1 ref={title} tabIndex={-1}>{t(`${game.id}:title`)}</h1></div></div>
    {phase === 'prepare' && <>
      <section className="panel preparation"><p className="lead">{t(`${game.id}:description`)}</p>
        <button className="button secondary" aria-expanded={showHelp} onClick={() => setShowHelp(value => !value)}>{t('explain')}</button>
        {showHelp && <Instructions id={game.id} />}
        {game.id === 'arithmetic' && <fieldset className="mode-picker"><legend>{t('mode')}</legend><div className="segmented">{['basic', 'mixed'].map(mode => <button key={mode} aria-pressed={variant === mode} onClick={() => setVariant(mode)}>{t(`arithmetic:variants.${mode}`)}</button>)}</div></fieldset>}
        <div className="best-summary"><span>{t(`${game.id}:recordLabel`, { defaultValue: t('personalBest') })}</span><strong>{record ? `${number(record.score)} ${t(`${game.id}:unit`)}` : t('notPlayed')}</strong></div>
        {game.recordMetrics?.map(metric => { const best = data.records.find(item => comparisonKey(item) === comparisonKey({ ...meta, metric })); return <div className="secondary-record" key={metric}><span>{t(`${game.id}:records.${metric}`)}</span><strong>{best ? `${number(best.score)} ${t(`${game.id}:unit`)}` : t('notPlayed')}</strong></div>; })}
        {game.id !== 'recognition' && data.records.some(item => item.game === game.id && item.variant === variant && item.ruleVersion !== meta.ruleVersion) && <Link className="text-link" to="/records">{t('previousRules')} →</Link>}
        <button className="button primary start-button" onClick={start}>{t('start')}<span aria-hidden="true">→</span></button>
        {game.id === 'recognition' && <p className="hint">{t('recognitionLanguage')}</p>}
      </section>
      <section className="history"><h2>{t('recent')}</h2>{history.length ? <ul>{history.map(item => <li key={item.id}><time dateTime={item.date}>{new Date(item.date).toLocaleDateString(data.settings.language)}</time><span>{number(item.score)} {t(`${game.id}:unit`)}{item.eligible === false && ' *'}</span><small>{t(`reasons.${item.reason ?? 'stopped'}`)}</small></li>)}</ul> : <p>{t('noHistory')}</p>}{history.some(item => item.eligible === false) && <p className="hint">* {t('noRecord')}</p>}</section>
    </>}
    {phase === 'playing' && <section className="panel play-panel">
      <div className="play-toolbar"><div><span className="score-label">{t(`${game.id}:scoreLabel`, { defaultValue: t(`${game.id}:unit`) })}</span><strong className="live-score">{progress.eligible === false ? '—' : number(progress.score)}</strong></div><button className="button secondary" onClick={() => { audio.pause(); setPause('help'); }}>{t('explain')}</button></div>
      {pause && <div className="pause-panel"><h2 ref={pauseTitle} tabIndex={-1}>{t(pause === 'help' ? 'explain' : 'paused')}</h2>{pause === 'help' ? <Instructions id={game.id} /> : <p>{t('pausedText')}</p>}<button className="button primary" onClick={() => { audio.unlock(); setPause(null); }}>{t('continue')}</button></div>}
      <div ref={gameArea} hidden={Boolean(pause)}><ErrorBoundary><Suspense fallback={<p role="status">{t('loading')}</p>}><ReadyContent key={round} onReady={positionContent}><Game language={language} variant={variant} paused={Boolean(pause)} onProgress={onProgress} onFinish={onFinish} /></ReadyContent></Suspense></ErrorBoundary></div>
      <div className="stop-row"><button className="button quiet" data-ui-sound="off" onClick={() => finish({ ...session.current!.progress, reason: 'stopped' })}>{t('stop')}</button><p className="hint">{t('sessionNavigation')}</p></div>
    </section>}
    {phase === 'result' && result && <section className="panel result-panel">
      <p className="eyebrow">{t(`reasons.${result.reason ?? 'completed'}`)}</p><h2>{t(newBest ? 'newBest' : 'result')}</h2>
      <div className="result-score">{result.eligible === false ? '—' : number(result.score)}<span>{t(`${game.id}:scoreLabel`, { defaultValue: t(`${game.id}:unit`) })}</span></div>
      {result.eligible === false && <p className="notice">{t(`${game.id}:incomplete`, { defaultValue: t('noRecord') })}</p>}{result.actions === 0 && <p className="hint">{t('noActions')}</p>}
      {previousBest !== null && <p className="previous-best">{t('previousBest', { score: number(previousBest), unit: t(`${game.id}:unit`) })}</p>}
      {!game.hideResultRecord && !newBest && record && <div className="best-summary"><span>{t('bestSoFar')}</span><strong>{number(record.score)} {t(`${game.id}:unit`)}</strong></div>}
      {result.review}
      {result.stats && <dl className="result-stats">{Object.entries(result.stats).map(([stat, value]) => <div key={stat}><dt>{t(`${game.id}:${stat}`)}</dt><dd>{typeof value === 'number' ? number(value) : value}</dd></div>)}</dl>}
      <div className="actions"><button className="button primary" onClick={() => { setResult(null); setShowHelp(false); setPhase('prepare'); }}>{t('again')}</button><Link className="button secondary" to="/" state={{ scrollTarget: 'games' }}>{t('menu')}</Link></div><p className="hint">{t('resultNote')}</p>
    </section>}
  </div>;
}
