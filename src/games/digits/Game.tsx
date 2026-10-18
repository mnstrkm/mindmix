import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameProps, GameResult } from '../../app/types';
import { audio } from '../../services/audio/audio';
import { NumericPad } from '../../shared/ui/NumericPad';
import { START_LENGTH } from './config';
import { completedScore, createSequence, matchesSequence } from './logic';
import './digits.css';

interface State {
  phase: 'memorize' | 'recall' | 'ended';
  sequence: string;
  answer: string;
  score: number;
  solved: number;
}

function progress(state: State): GameResult {
  return { score: state.score, actions: state.solved, stats: { 'stats.completedRounds': state.solved } };
}

export default function Game({ paused, onProgress, onFinish }: GameProps) {
  const { t } = useTranslation('digits');
  const [state, setState] = useState<State>(() => ({ phase: 'memorize', sequence: createSequence(START_LENGTH), answer: '', score: 0, solved: 0 }));
  const current = useRef(state);
  const container = useRef<HTMLDivElement>(null);

  function update(next: State) {
    current.current = next;
    setState(next);
  }

  useEffect(() => { onProgress(progress(current.current)); }, [onProgress]);
  useEffect(() => {
    if (!paused) container.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
  }, [state.phase, state.sequence, paused]);

  function conceal() {
    if (paused || current.current.phase !== 'memorize') return;
    update({ ...current.current, phase: 'recall' });
  }

  function confirm() {
    const previous = current.current;
    if (paused || previous.phase !== 'recall') return;
    if (!matchesSequence(previous.sequence, previous.answer)) {
      update({ ...previous, phase: 'ended' });
      onFinish({ ...progress(previous), actions: previous.solved + 1, reason: 'mistake' });
      return;
    }
    const next: State = {
      phase: 'memorize',
      sequence: createSequence(previous.sequence.length + 1),
      answer: '',
      score: completedScore(previous.score, previous.sequence, previous.answer),
      solved: previous.solved + 1,
    };
    update(next);
    audio.play('correct');
    onProgress(progress(next));
  }

  return (
    <div className="game-content digits-game" ref={container}>
      <p className="status-line">{t('length', { count: state.sequence.length })}</p>
      {state.phase === 'memorize' ? (
        <>
          <p>{t('memorize')}</p>
          <p className="stimulus digit-sequence" aria-label={t('sequence', { sequence: state.sequence.split('').join(' ') })}>
            {state.sequence.split('').map((digit, index) => <span aria-hidden="true" key={index}>{digit}</span>)}
          </p>
          <button type="button" className="button primary" onClick={conceal} disabled={paused}>{t('hide')}</button>
        </>
      ) : state.phase === 'recall' ? (
        <>
          <p>{t('recall')}</p>
          <p className="hint">{t('entered', { count: state.answer.length, required: state.sequence.length })}</p>
          <NumericPad value={state.answer} onChange={answer => {
            if (!paused && current.current.phase === 'recall') update({ ...current.current, answer });
          }} onConfirm={confirm} maxLength={state.sequence.length} disabled={paused} />
        </>
      ) : null}
    </div>
  );
}
