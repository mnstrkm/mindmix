import { PROGRESSION } from './config';

export const directions = ['up', 'upRight', 'right', 'downRight', 'down', 'downLeft', 'left', 'upLeft'] as const;
export type Direction = typeof directions[number];
export interface SearchTask { target: Direction; cells: Direction[]; targetIndex: number; rows: number; columns: number; level: number }

export function difficulty(solved: number) {
  let index = 0;
  PROGRESSION.forEach((step, i) => { if (solved >= step.from) index = i; });
  return { ...PROGRESSION[index]!, level: index + 1 };
}

function pick<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(Math.min(0.999999999, Math.max(0, random())) * values.length)]!;
}

export function createTask(solved: number, random: () => number): SearchTask {
  const { rows, columns, level, distractors } = difficulty(solved);
  const cardinal: Direction[] = ['up', 'right', 'down', 'left'];
  const target = pick(distractors === 'all' ? directions : cardinal, random);
  const choices = distractors === 'opposite'
    ? [directions[(directions.indexOf(target) + 4) % directions.length]!]
    : (distractors === 'cardinal' ? cardinal : [...directions]).filter((direction) => direction !== target);
  const targetIndex = pick(Array.from({ length: rows * columns }, (_, index) => index), random);
  const cells = Array.from({ length: rows * columns }, (_, index) => index === targetIndex ? target : pick(choices, random));
  return { target, cells, targetIndex, rows, columns, level };
}

export function isTarget(task: SearchTask, index: number): boolean {
  return index >= 0 && index < task.cells.length && index === task.targetIndex;
}
