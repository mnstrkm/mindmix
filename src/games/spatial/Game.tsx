import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GameProps, GameResult } from '../../app/types';
import { audio } from '../../services/audio/audio';
import { createPattern, difficultyIndex, getDifficulty, matchesPattern, toggleCell } from './logic';
import './spatial.css';
import ResultReview from './ResultReview';

interface State {
  phase: 'memorize' | 'recall' | 'ended';
  pattern: number[];
  selected: number[];
  solved: number;
}

function progress(state: State): GameResult {
  const difficulty = getDifficulty(state.solved);
  return {
    score: state.solved,
    actions: state.solved,
    review: state.phase !== 'memorize' ? <ResultReview pattern={state.pattern} selected={state.selected} rows={difficulty.rows} columns={difficulty.columns} /> : undefined,
    stats: {
      'stats.highestLevel': difficultyIndex(state.solved) + 1,
      'stats.rows': difficulty.rows,
      'stats.columns': difficulty.columns,
      'stats.marked': difficulty.marked,
    },
  };
}

export default function Game({ paused, onProgress, onFinish }: GameProps) {
  const { t } = useTranslation('spatial');
  const [state, setState] = useState<State>(() => ({ phase: 'memorize', pattern: createPattern(getDifficulty(0)), selected: [], solved: 0 }));
  const current = useRef(state);
  const container = useRef<HTMLDivElement>(null);
  const difficulty = getDifficulty(state.solved);

  function update(next: State) {
    current.current = next;
    setState(next);
    onProgress(progress(next));
  }

  useEffect(() => { onProgress(progress(current.current)); }, [onProgress]);
  useEffect(() => {
    if (!paused) container.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus();
  }, [state.phase, state.solved, paused]);

  function conceal() {
    if (paused || current.current.phase !== 'memorize') return;
    update({ ...current.current, phase: 'recall' });
  }

  function choose(cell: number) {
    if (paused || current.current.phase !== 'recall') return;
    update({ ...current.current, selected: toggleCell(current.current.selected, cell) });
  }

  function confirm() {
    const previous = current.current;
    if (paused || previous.phase !== 'recall') return;
    if (!matchesPattern(previous.pattern, previous.selected)) {
      update({ ...previous, phase: 'ended' });
      onFinish({ ...progress(previous), actions: previous.solved + 1, reason: 'mistake' });
      return;
    }
    const next: State = {
      phase: 'memorize',
      pattern: createPattern(getDifficulty(previous.solved + 1), previous.pattern),
      selected: [],
      solved: previous.solved + 1,
    };
    update(next);
    audio.play('correct');
  }

  if (state.phase === 'ended') return null;

  return (
    <div className="game-content spatial-game" ref={container}>
      <p className="status-line">{t('difficulty', { level: difficultyIndex(state.solved) + 1, ...difficulty })}</p>
      <p>{t(state.phase === 'memorize' ? 'memorize' : 'recall')}</p>
      <div className="game-grid spatial-grid" role="group" aria-label={t('grid', { ...difficulty })} style={{ gridTemplateColumns: `repeat(${difficulty.columns}, minmax(0, 1fr))` }}>
        {Array.from({ length: difficulty.rows * difficulty.columns }, (_, cell) => {
          const marked = state.phase === 'memorize' && state.pattern.includes(cell);
          const selected = state.phase === 'recall' && state.selected.includes(cell);
          return (
            <button
              type="button"
              key={cell}
              className={`tile spatial-cell${marked ? ' marked' : ''}${selected ? ' selected' : ''}`}
              aria-label={t(marked ? 'markedCell' : 'cell', { row: Math.floor(cell / difficulty.columns) + 1, column: cell % difficulty.columns + 1 })}
              aria-pressed={state.phase === 'recall' ? selected : undefined}
              disabled={paused || state.phase !== 'recall'}
              onClick={() => choose(cell)}
            >
              {(marked || selected) && <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="7" fill="currentColor" /></svg>}
            </button>
          );
        })}
      </div>
      {state.phase === 'memorize' ? (
        <button type="button" className="button primary" onClick={conceal} disabled={paused}>{t('hide')}</button>
      ) : (
        <>
          <p className="hint" aria-live="polite">{t('selectedCount', { count: state.selected.length, required: difficulty.marked })}</p>
          <button type="button" className="button primary" onClick={confirm} disabled={paused}>{t('confirm')}</button>
        </>
      )}
    </div>
  );
}
