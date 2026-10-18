import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameProps, GameResult } from '../../app/types';
import { audio } from '../../services/audio/audio';
import { INPUT_FEEDBACK_MS, PAD_SYMBOLS, PRESENTATION_DELAY_MS, ROUND_FEEDBACK_MS, SIGNAL_DURATION_MS, SIGNAL_GAP_MS, START_LENGTH } from './config';
import { checkSignal, createSequence, extendSequence, type Signal } from './logic';
import './simon.css';
import { focusAndReveal } from '../../shared/ui/viewport';

interface State {
  phase: 'presenting' | 'input' | 'round-complete' | 'ended';
  sequence: Signal[];
  inputIndex: number;
  active: Signal | null;
  score: number;
  solved: number;
  actions: number;
}

function progress(state: State): GameResult {
  return { score: state.score, actions: state.actions, stats: { 'stats.completedRounds': state.solved } };
}

export default function Game({ paused, onProgress, onFinish }: GameProps) {
  const { t } = useTranslation('simon');
  const [state, setState] = useState<State>(() => ({ phase: 'presenting', sequence: createSequence(START_LENGTH), inputIndex: 0, active: null, score: 0, solved: 0, actions: 0 }));
  const current = useRef(state);
  const [round, setRound] = useState(0);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const inputLocked = useRef(false);
  const firstPad = useRef<HTMLButtonElement>(null);

  function update(next: State) {
    current.current = next;
    setState(next);
  }

  useEffect(() => { onProgress(progress(current.current)); }, [onProgress]);
  useEffect(() => () => { audio.stopEffects({ preserveUi: true }); }, []);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    clearTimeout(feedbackTimer.current);
    inputLocked.current = false;
    const previous = current.current;
    if (previous.phase !== 'ended' && previous.phase !== 'round-complete') {
      // Once recall has started, pausing may never reveal the sequence again.
      update({ ...previous, active: null, phase: previous.inputIndex > 0 ? 'input' : 'presenting' });
    }

    function later(callback: () => void, milliseconds: number) {
      timer = setTimeout(() => { if (!cancelled) callback(); }, milliseconds);
    }

    function play(index: number) {
      const nextSignal = current.current.sequence[index];
      if (nextSignal === undefined) {
        update({ ...current.current, phase: 'input', active: null });
        return;
      }
      update({ ...current.current, active: nextSignal });
      audio.play(`simon${nextSignal}`);
      later(() => {
        update({ ...current.current, active: null });
        later(() => play(index + 1), SIGNAL_GAP_MS);
      }, SIGNAL_DURATION_MS);
    }

    if (!paused && current.current.phase === 'presenting') later(() => play(0), PRESENTATION_DELAY_MS);
    if (paused) audio.stopEffects();
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearTimeout(feedbackTimer.current);
    };
  }, [paused, round]);

  useEffect(() => {
    if (state.phase !== 'round-complete' || paused) return;
    // Keep the final accepted pad visibly lit before extending the sequence.
    update({ ...current.current, active: current.current.sequence.at(-1)! });
    const timer = setTimeout(() => {
      update({ ...current.current, phase: 'presenting', sequence: extendSequence(current.current.sequence), inputIndex: 0, active: null });
      setRound(value => value + 1);
    }, ROUND_FEEDBACK_MS);
    return () => clearTimeout(timer);
  }, [state.phase, paused]);

  useEffect(() => {
    if (state.phase === 'input' && !paused) focusAndReveal(firstPad.current);
  }, [state.phase, paused]);

  function choose(signal: Signal) {
    const previous = current.current;
    if (paused || previous.phase !== 'input' || inputLocked.current) return;
    inputLocked.current = true;
    const outcome = checkSignal(previous.sequence, previous.inputIndex, signal);
    if (outcome === 'wrong') {
      update({ ...previous, phase: 'ended', active: null });
      audio.stopEffects();
      onFinish({ ...progress(previous), actions: previous.actions + 1, reason: 'mistake' });
      return;
    }
    audio.play(`simon${signal}`);
    if (outcome === 'complete') {
      const next: State = {
        phase: 'round-complete', sequence: previous.sequence, inputIndex: previous.sequence.length,
        active: signal, score: previous.sequence.length, solved: previous.solved + 1, actions: previous.actions + 1,
      };
      update(next);
      onProgress(progress(next));
      return;
    }
    const next = { ...previous, active: signal, inputIndex: previous.inputIndex + 1, actions: previous.actions + 1 };
    update(next);
    onProgress(progress(next));
    feedbackTimer.current = setTimeout(() => {
      inputLocked.current = false;
      update({ ...current.current, active: null });
    }, INPUT_FEEDBACK_MS);
  }

  return (
    <div className="game-content simon-game">
      <p className="status-line">{t('length', { count: state.sequence.length })}</p>
      <p className="simon-phase" role="status">{t(state.phase === 'input' ? 'yourTurn' : state.phase === 'round-complete' ? 'roundComplete' : 'watching')}</p>
      <div className="simon-grid" data-ui-sound="off">
        {PAD_SYMBOLS.map((symbol, index) => (
          <button
            type="button"
            key={index}
            ref={index === 0 ? firstPad : undefined}
            className={`simon-pad simon-pad-${index}${state.active === index ? ' active' : ''}`}
            aria-label={t(`pad${index}`)}
            disabled={paused || state.phase !== 'input'}
            aria-disabled={state.phase === 'input' && state.active !== null ? true : undefined}
            onClick={event => { if (event.detail <= 1) choose(index as Signal); }}
            onKeyDown={event => { if (event.repeat) event.preventDefault(); }}
          ><span aria-hidden="true">{symbol}</span></button>
        ))}
      </div>
    </div>
  );
}
