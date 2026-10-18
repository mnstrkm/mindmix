import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameProps, GameResult } from '../../app/types';
import { audio } from '../../services/audio/audio';
import { RECOGNITION_CONFIG } from './config';
import { words } from './words';
import { answerRecognition, createRecognition, type RecognitionAnswer } from './logic';

export default function RecognitionGame({ language, paused, onProgress, onFinish }: GameProps) {
  const { t } = useTranslation('recognition');
  // The host restarts the game on a language change. Freeze its pool defensively too.
  const pool = useRef(words[language]).current;
  const [state, setState] = useState(() => createRecognition(pool));
  const current = useRef(state);
  const [locked, setLocked] = useState(false);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lockedRef = useRef(false);
  const finalized = useRef(false);
  useEffect(() => () => clearTimeout(unlockTimer.current), []);
  useEffect(() => {
    if (paused) {
      clearTimeout(unlockTimer.current);
      lockedRef.current = false;
      setLocked(false);
    }
  }, [paused]);
  useEffect(() => {
    const result: GameResult = {
      score: state.score, actions: state.actions,
      stats: { 'stats.newWords': state.newCorrect, 'stats.repeats': state.repeatCorrect },
      eligible: state.actions > 0,
    };
    if (state.ended === 'mistake') result.stats!['stats.correction'] = t('correction', {
      word: state.prompt.word, answer: t(state.prompt.seenBefore ? 'repeatAnswer' : 'newAnswer'),
    });
    if (state.ended === 'completed') result.stats!['stats.completion'] = t('exhausted');
    onProgress(result);
    if (state.ended && !finalized.current) {
      finalized.current = true;
      onFinish({ ...result, reason: state.ended });
    }
  }, [state, onProgress, onFinish, t]);

  function answer(choice: RecognitionAnswer) {
    if (paused || lockedRef.current || current.current.ended) return;
    lockedRef.current = true;
    setLocked(true);
    const next = answerRecognition(current.current, choice, pool);
    current.current = next;
    setState(next);
    if (next.score > state.score) audio.play('correct');
    unlockTimer.current = setTimeout(() => { lockedRef.current = false; setLocked(false); }, RECOGNITION_CONFIG.inputGuardMs);
  }

  return <section className="game-content">
    <p className="status-line" aria-live="polite">{t('score', { count: state.score })}</p>
    <div className="stimulus" aria-label={t('promptLabel')} aria-live="polite">{state.prompt.word}</div>
    <div className="actions" data-ui-sound="off">
      <button className="button secondary" disabled={paused || !!state.ended} aria-disabled={locked || undefined} onClick={event => { if (event.detail <= 1) answer('new'); }}>{t('new')}</button>
      <button className="button primary" disabled={paused || !!state.ended} aria-disabled={locked || undefined} onClick={event => { if (event.detail <= 1) answer('repeat'); }}>{t('repeat')}</button>
    </div>
    <p className="hint">{t('languageNotice')}</p>
  </section>;
}
