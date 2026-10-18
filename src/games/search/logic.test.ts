import { describe, expect, it } from 'vitest';
import { createTask, difficulty, isTarget } from './logic';

function seeded(seed = 91) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

describe('visual search', () => {
  it('generates exactly one matching direction in a bounded grid at every level', () => {
    const random = seeded();
    for (let solved = 0; solved < 2000; solved += 1) {
      const task = createTask(solved, random);
      expect(task.cells.filter((cell) => cell === task.target)).toHaveLength(1);
      expect(task.cells).toHaveLength(task.rows * task.columns);
      expect(task.rows).toBeLessThanOrEqual(4);
      expect(task.columns).toBeLessThanOrEqual(4);
      expect(isTarget(task, task.targetIndex)).toBe(true);
      expect(isTarget(task, -1)).toBe(false);
      expect(isTarget(task, (task.targetIndex + 1) % task.cells.length)).toBe(false);
    }
  });
  it('increases the grid before distractor similarity and then plateaus', () => {
    expect(difficulty(0)).toMatchObject({ rows: 2, columns: 2, distractors: 'opposite' });
    expect(difficulty(16)).toMatchObject({ rows: 4, columns: 4, distractors: 'opposite' });
    expect(difficulty(20)).toMatchObject({ rows: 4, columns: 4, distractors: 'cardinal' });
    expect(difficulty(24)).toEqual(difficulty(10000));
  });
  it('can place the target at both ends of the grid', () => {
    expect(createTask(24, () => 0).targetIndex).toBe(0);
    expect(createTask(24, () => 0.9999).targetIndex).toBe(15);
  });
});
