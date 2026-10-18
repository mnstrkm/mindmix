import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameProps } from '../../app/types';
import { audio } from '../../services/audio/audio';
import { FEEDBACK_MS } from './config';
import { correctSide, createTask, difficulty, type Side } from './logic';
import './switch.css';

export default function Game({ paused, onProgress, onFinish }: GameProps) {
  const { t } = useTranslation('switch');
  const [state, setState] = useState(() => ({ task: createTask(0, Math.random), solved: 0, switches: 0, feedback: false }));
  const locked = useRef(false);
  const { task } = state;
  const level = difficulty(state.solved).level;

  useEffect(() => {
    onProgress({ score: state.solved, actions: state.solved, stats: { 'stats.level': level, 'stats.switches': state.switches } });
  }, [state.solved, state.switches, level, onProgress]);

  useEffect(() => {
    if (!state.feedback || paused) return;
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, task: createTask(current.solved, Math.random, current.task), feedback: false }));
      locked.current = false;
    }, FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [state.feedback, paused]);

  function choose(side: Side, clickCount: number) {
    if (paused || locked.current || state.feedback || clickCount > 1) return;
    locked.current = true;
    if (side !== correctSide(task)) {
      onFinish({
        score: state.solved, actions: state.solved + 1, reason: 'mistake',
        stats: { 'stats.level': level, 'stats.switches': state.switches },
      });
      return;
    }
    audio.play('correct');
    setState((current) => ({ ...current, solved: current.solved + 1, switches: current.switches + (current.task.switched ? 1 : 0), feedback: true }));
  }

  return <div className="game-content">
    <p className="status-line">{t('status', { count: state.solved, level })}</p>
    <div className={`switch-rule${task.switched ? ' switch-rule-changed' : ''}`}>
      <span>{t('currentRule')}</span>
      <strong>{t(`rules.${task.rule}`)}</strong>
    </div>
    <p className="hint" role="status">{state.feedback ? t('correct') : task.switched ? t('changed', { rule: t(`rules.${task.rule}`) }) : t(task.rule === 'color' ? 'colorHint' : 'shapeHint')}</p>
    <div className="switch-object" role="img" aria-label={t('object', { shape: t(`shapes.${task.shape}`), color: t(`colors.${task.color}`) })}>
      <svg viewBox="0 0 120 120" aria-hidden="true" focusable="false" className={`switch-shape switch-${task.color}`}>
        {task.shape === 'circle' ? <circle cx="60" cy="60" r="47" fill="currentColor" /> : <path d="M60 10 113 107H7Z" fill="currentColor" />}
      </svg>
      <span aria-hidden="true">{t('colorLabel', { color: t(`colors.${task.color}`) })}</span>
    </div>
    <div className="switch-answers" role="group" aria-label={t('answers')}>
      <button className="button secondary" type="button" disabled={paused || state.feedback} onClick={(event) => choose('left', event.detail)}>{t('left')}</button>
      <button className="button secondary" type="button" disabled={paused || state.feedback} onClick={(event) => choose('right', event.detail)}>{t('right')}</button>
    </div>
  </div>;
}
