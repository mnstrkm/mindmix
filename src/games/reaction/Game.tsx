import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { GameProps, GameResult } from '../../app/types';
import { audio } from '../../services/audio/audio';
import { REACTION_CONFIG } from './config';
import { average, beginTrial, chooseReactionMode, completeReaction, createReaction, interruptTrial, isEligible, randomDelay,
  reactToSignal, showSignal, type ReactionState } from './logic';
import './reaction.css';

export default function ReactionGame({ paused, language, onProgress, onFinish }: GameProps) {
  const { t } = useTranslation('reaction');
  const [state, setState] = useState(createReaction);
  const [interrupted, setInterrupted] = useState(false);
  const current = useRef(state);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;
  const finalized = useRef(false);
  const target = useRef<HTMLButtonElement>(null);
  const nextAction = useRef<HTMLButtonElement>(null);
  const pending = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const frame = useRef<number | undefined>(undefined);
  const lastInput = useRef(-Infinity);
  const format = (time: number) => Math.round(time).toLocaleString(language);

  function commit(next: ReactionState) { current.current = next; setState(next); }

  useEffect(() => {
    if (!paused && (state.phase === 'ready' || state.phase === 'feedback')) nextAction.current?.focus();
  }, [state.phase, paused]);

  useEffect(() => {
    if (paused) {
      const next = interruptTrial(current.current);
      if (next !== current.current) { current.current = next; setState(next); setInterrupted(true); }
    }
  }, [paused]);

  useEffect(() => {
    if (state.phase !== 'waiting' || paused) return;
    target.current?.focus();
    pending.current = setTimeout(() => {
      frame.current = requestAnimationFrame(() => {
        if (pausedRef.current || current.current.phase !== 'waiting') return;
        // Timestamp and DOM update share one animation frame, just before paint.
        // Browser/display latency remains part of this personal comparison value.
        const next = showSignal(current.current, performance.now());
        current.current = next;
        flushSync(() => setState(next));
      });
    }, randomDelay(Math.random));
    return () => {
      clearTimeout(pending.current);
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
    };
  }, [state.phase, paused]);

  useEffect(() => {
    const eligible = isEligible(state);
    const result: GameResult = {
      score: eligible ? Math.round(average(state.times)) : 0,
      actions: state.times.length + state.falseStarts, eligible,
      stats: { 'stats.validTrials': state.times.length, 'stats.falseStarts': state.falseStarts },
    };
    if (state.times.length > 0) {
      result.recordScores = { fastest: Math.round(Math.min(...state.times)) };
      result.stats!['stats.average'] = Math.round(average(state.times));
      result.stats!['stats.fastest'] = Math.round(Math.min(...state.times));
      result.stats!['stats.measurements'] = state.times.map(time => Math.round(time).toLocaleString(language)).join(' · ');
    }
    onProgress(result);
    if (state.phase === 'ended' && !finalized.current) {
      finalized.current = true;
      onFinish({ ...result, reason: eligible ? 'completed' : 'false-starts' });
    }
  }, [state, language, onProgress, onFinish]);

  function respond() {
    const now = performance.now();
    if (pausedRef.current || now - lastInput.current < REACTION_CONFIG.inputGuardMs) return;
    const next = reactToSignal(current.current, now);
    if (next === current.current) return;
    lastInput.current = now;
    commit(next);
    if (!next.lastWasEarly) audio.play('correct');
  }
  function start() {
    if (paused || performance.now() - lastInput.current < REACTION_CONFIG.inputGuardMs) return;
    setInterrupted(false);
    commit(beginTrial(current.current));
  }
  const active = state.phase === 'waiting' || state.phase === 'signal';

  return <section className="game-content reaction-game">
    <p className="status-line">{state.practice ? t('practiceLabel') : t('measuredLabel', {
      current: Math.min(REACTION_CONFIG.validTrials, state.times.length + (state.phase === 'feedback' ? 0 : 1)), total: REACTION_CONFIG.validTrials,
    })}</p>
    {state.phase === 'choice' && <>
      <p>{t('practiceQuestion')}</p>
      <div className="actions">
        <button className="button secondary" disabled={paused} onClick={() => commit(chooseReactionMode(current.current, true))}>{t('practice')}</button>
        <button className="button primary" disabled={paused} onClick={() => commit(chooseReactionMode(current.current, false))}>{t('skipPractice')}</button>
      </div>
    </>}
    {state.phase === 'ready' && <>
      <p role="status">{t(interrupted ? 'interrupted' : 'ready')}</p>
      <button ref={nextAction} className="button primary" disabled={paused} onClick={start}>{t(state.practice ? 'startPractice' : 'startTrial')}</button>
    </>}
    {active && <button ref={target} className={`reaction-target ${state.phase}`} disabled={paused}
      aria-label={t(state.phase === 'signal' ? 'nowLabel' : 'waitingLabel')}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        event.preventDefault(); respond();
      }}
      onKeyDown={event => {
        if (event.key !== ' ' && event.key !== 'Enter') return;
        event.preventDefault(); if (!event.repeat) respond();
      }}
      onClick={event => event.preventDefault()}>
      <span aria-hidden="true" className="reaction-indicator">{state.phase === 'signal' ? '✓' : '…'}</span>
      <span>{t(state.phase === 'signal' ? 'now' : 'waiting')}</span>
    </button>}
    {state.phase === 'feedback' && <>
      <p className="stimulus" role="status">{state.lastWasEarly
        ? t(state.practice ? 'practiceEarly' : 'early')
        : t(state.practice ? 'practiceTime' : 'measuredTime', { time: format(state.lastTime ?? 0) })}</p>
      {isEligible(state) && <p className="reaction-summary">{t('averagePreview', { time: format(average(state.times)) })}</p>}
      <button ref={nextAction} className="button primary" disabled={paused} onClick={() => {
        if (state.practice) commit(chooseReactionMode(current.current, false));
        else if (isEligible(state)) commit(completeReaction(current.current));
        else start();
      }}>{t(state.practice ? 'startMeasured' : isEligible(state) ? 'showResult' : 'nextTrial')}</button>
    </>}
    {state.phase === 'ended' && <p role="status">{t(isEligible(state) ? 'completed' : 'failed')}</p>}
    <div className="reaction-counts">
      <p>{t('validCount', { count: state.times.length, total: REACTION_CONFIG.validTrials })}</p>
      <p>{t('falseStartCount', { count: state.falseStarts, maximum: REACTION_CONFIG.maximumFalseStarts })}</p>
    </div>
    <p className="hint">{t('caveat')}</p>
  </section>;
}
