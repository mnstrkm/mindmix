import { describe, expect, it } from 'vitest';
import { difficulty, evaluate, isAnswerCorrect, nextTask, type Mode, type Task } from './logic';

function seeded(seed = 19) { return () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

describe('arithmetic', () => {
  it.each<Mode>(['basic', 'mixed'])('keeps %s questions inside their configured ranges', (mode) => {
    let previous: Task | undefined;
    const random = seeded();
    for (let solved = 0; solved < 4000; solved += 1) {
      const task = nextTask(mode, solved, random, previous);
      const q = task.question;
      expect(q.answer).toBe(evaluate(q.left, q.right, q.operation));
      expect(Number.isInteger(q.answer)).toBe(true);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.right).toBeGreaterThan(0);
      if (q.operation === '+' || q.operation === '−') {
        const maximum = difficulty(mode, solved).maximum;
        expect(Math.max(q.left, q.right, q.answer)).toBeLessThanOrEqual(maximum);
      } else if (q.operation === '×') {
        expect(Math.max(q.left, q.right)).toBeLessThanOrEqual(10);
      } else {
        expect(Math.max(q.answer, q.right)).toBeLessThanOrEqual(10);
      }
      expect(q).not.toEqual(previous?.question);
      previous = task;
    }
  });
  it('balances each operation bag and remains open after its progression plateau', () => {
    let previous: Task | undefined;
    const random = seeded();
    const counts = new Map<string, number>();
    for (let i = 0; i < 80; i += 1) {
      previous = nextTask('mixed', i, random, previous);
      counts.set(previous.question.operation, (counts.get(previous.question.operation) ?? 0) + 1);
    }
    expect([...counts.values()]).toEqual([20, 20, 20, 20]);
    expect(difficulty('mixed', 10000)).toEqual(difficulty('mixed', 15));
  });
  it('does not hang or repeat with a constant random source', () => {
    let task = nextTask('basic', 0, () => 0);
    task = { ...task, bag: ['+'] };
    const following = nextTask('basic', 0, () => 0, task);
    expect(following.question).not.toEqual(task.question);
  });
  it('only accepts a confirmed numeric answer', () => {
    const question = { left: 7, right: 5, operation: '+' as const, answer: 12 };
    expect(isAnswerCorrect('012', question)).toBe(true);
    expect(isAnswerCorrect('', question)).toBe(false);
    expect(isAnswerCorrect('12.0', question)).toBe(false);
    expect(isAnswerCorrect('13', question)).toBe(false);
  });
});
