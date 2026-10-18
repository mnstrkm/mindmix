import { describe, expect, it } from 'vitest';
import { LEVEL_THRESHOLDS, PROGRESSION } from './config';
import { createPattern, difficultyIndex, getDifficulty, matchesPattern, toggleCell } from './logic';

describe('spatial patterns', () => {
  it('keeps the initial progression and adds larger grids with slower steps', () => {
    expect(PROGRESSION.slice(0, 11).map(level => [level.rows, level.columns, level.marked])).toEqual([
      [2, 2, 2], [3, 2, 2], [3, 2, 3], [3, 3, 3], [3, 3, 4], [4, 3, 4],
      [4, 3, 5], [4, 4, 5], [4, 4, 6], [4, 4, 7], [4, 4, 8],
    ]);
    expect(getDifficulty(11)).toEqual(getDifficulty(10));
    expect(getDifficulty(12)).toEqual({ rows: 5, columns: 4, marked: 8 });
    expect(getDifficulty(10_000)).toEqual({ rows: 8, columns: 4, marked: 16 });
    expect(difficultyIndex(10_000)).toBe(PROGRESSION.length - 1);
    expect(LEVEL_THRESHOLDS).toHaveLength(PROGRESSION.length);
    expect(PROGRESSION.every(level => level.columns <= 4)).toBe(true);
  });

  it('creates distinct, valid cells with no identical adjacent pattern', () => {
    let previous: number[] = [];
    for (let solved = 0; solved < 100; solved++) {
      const difficulty = getDifficulty(solved);
      const pattern = createPattern(difficulty, previous, () => 0);
      expect(pattern).toHaveLength(difficulty.marked);
      expect(new Set(pattern).size).toBe(difficulty.marked);
      expect(pattern.every(cell => cell >= 0 && cell < difficulty.rows * difficulty.columns)).toBe(true);
      expect(matchesPattern(pattern, previous)).toBe(false);
      previous = pattern;
    }
  });

  it('requires the exact set and allows correcting selections', () => {
    expect(matchesPattern([1, 2], [2, 1])).toBe(true);
    expect(matchesPattern([1, 2], [1])).toBe(false);
    expect(matchesPattern([1, 2], [1, 1])).toBe(false);
    expect(matchesPattern([1, 2], [1, 2, 3])).toBe(false);
    expect(toggleCell([1], 2)).toEqual([1, 2]);
    expect(toggleCell([1, 2], 1)).toEqual([2]);
  });
});
