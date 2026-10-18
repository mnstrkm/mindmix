import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameProps, GameResult } from '../../app/types';
import { NumericPad } from '../../shared/ui/NumericPad';
import { audio } from '../../services/audio/audio';
import { FEEDBACK_MS } from './config';
import { difficulty, equation, isAnswerCorrect, nextTask } from './logic';

export default function Game({ variant, paused, onProgress, onFinish }: GameProps) {
  const { t } = useTranslation('arithmetic');
  const mode = variant === 'mixed' ? 'mixed' : 'basic';
  const [state, setState] = useState(() => ({ task: nextTask(mode, 0, Math.random), solved: 0, feedback: false }));
  const [value, setValue] = useState('');
  const locked = useRef(false);
  const level = difficulty(mode, state.solved).level;

  useEffect(() => {
    onProgress({ score: state.solved, actions: state.solved, stats: { 'stats.level': level } });
  }, [state.solved, level, onProgress]);

  useEffect(() => {
    if (!state.feedback || paused) return;
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, task: nextTask(mode, current.solved, Math.random, current.task), feedback: false }));
      setValue('');
      locked.current = false;
    }, FEEDBACK_MS);
    return () => window.clearTimeout(timer);
  }, [state.feedback, paused, mode]);

  function submit() {
    if (paused || locked.current || state.feedback || !value) return;
    locked.current = true;
    if (!isAnswerCorrect(value, state.task.question)) {
      const result: GameResult = {
        score: state.solved, actions: state.solved + 1, reason: 'mistake',
        stats: { 'stats.level': level, 'stats.solution': equation(state.task.question) },
      };
      onFinish(result);
      return;
    }
    audio.play('correct');
    setState((current) => ({ ...current, solved: current.solved + 1, feedback: true }));
  }

  return <div className="game-content">
    <p className="status-line">{t('status', { count: state.solved, level })}</p>
    <p className="stimulus" aria-live="polite">{t('question', { ...state.task.question })}</p>
    <p className="answer-feedback hint" role="status">{state.feedback ? t('correct') : ''}</p>
    <NumericPad value={value} onChange={(next) => { if (!paused && !locked.current) setValue(next); }} onConfirm={submit} maxLength={3} disabled={paused || state.feedback} />
  </div>;
}
