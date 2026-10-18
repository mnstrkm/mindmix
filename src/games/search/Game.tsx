import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameProps } from '../../app/types';
import { audio } from '../../services/audio/audio';
import { FEEDBACK_MS } from './config';
import { createTask, isTarget } from './logic';
import './search.css';
import Arrow from './Arrow';
import ResultReview from './ResultReview';

export default function Game({ paused, onProgress, onFinish }: GameProps) {
  const { t } = useTranslation('search');
  const [state, setState] = useState(() => ({ task: createTask(0, Math.random), solved: 0, feedback: false, selected: null as number | null }));
  const locked = useRef(false);
  const { task } = state;
  const stats = { 'stats.level': task.level, 'stats.grid': `${task.rows} × ${task.columns}` };

  useEffect(() => {
    onProgress({ score: state.solved, actions: state.solved, stats: { 'stats.level': task.level, 'stats.grid': `${task.rows} × ${task.columns}` } });
  }, [state.solved, task.level, task.rows, task.columns, onProgress]);

  useEffect(() => {
    if (!state.feedback || paused) return;
    const timer = window.setTimeout(() => {
      setState((current) => ({ solved: current.solved, task: createTask(current.solved, Math.random), feedback: false, selected: null }));
      locked.current = false;
    }, FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [state.feedback, paused]);

  function choose(index: number, clickCount: number) {
    if (paused || locked.current || state.feedback || clickCount > 1) return;
    locked.current = true;
    if (!isTarget(task, index)) {
      onFinish({ score: state.solved, actions: state.solved + 1, reason: 'mistake', stats, review: <ResultReview task={task} selected={index} /> });
      return;
    }
    audio.play('correct');
    setState((current) => ({ ...current, solved: current.solved + 1, feedback: true, selected: index }));
  }

  return <div className="game-content">
    <p className="status-line">{t('status', { count: state.solved, level: task.level })}</p>
    <div className="search-target" role="img" aria-label={t('target', { direction: t(`directions.${task.target}`) })}>
      <span aria-hidden="true">{t('find')}</span>
      <Arrow direction={task.target} />
    </div>
    <p className="hint" role="status">{state.feedback ? t('correct') : t('hint')}</p>
    <div className="game-grid search-grid" data-ui-sound="off" style={{ gridTemplateColumns: `repeat(${task.columns}, minmax(0, 1fr))` }} role="group" aria-label={t('grid')}>
      {task.cells.map((direction, index) => <button type="button" className={`tile${state.selected === index ? ' selected' : ''}`} key={index}
        disabled={paused || state.feedback} onClick={(event) => choose(index, event.detail)}
        aria-label={t('cell', { row: Math.floor(index / task.columns) + 1, column: index % task.columns + 1, direction: t(`directions.${direction}`) })}>
        <Arrow direction={direction} />
      </button>)}
    </div>
  </div>;
}
