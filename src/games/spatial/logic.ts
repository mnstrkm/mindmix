import { PROGRESSION, type Difficulty } from './config';

export function difficultyIndex(solved: number): number {
  return Math.min(Math.max(0, solved), PROGRESSION.length - 1);
}

export function getDifficulty(solved: number): Difficulty {
  return PROGRESSION[difficultyIndex(solved)]!;
}

export function matchesPattern(pattern: readonly number[], selected: readonly number[]): boolean {
  return selected.length === pattern.length && new Set(selected).size === selected.length && pattern.every(cell => selected.includes(cell));
}

export function createPattern(difficulty: Difficulty, previous: readonly number[] = [], random: () => number = Math.random): number[] {
  const cells = Array.from({ length: difficulty.rows * difficulty.columns }, (_, index) => index);
  for (let index = cells.length - 1; index > 0; index--) {
    const swap = Math.floor(random() * (index + 1));
    [cells[index], cells[swap]] = [cells[swap]!, cells[index]!];
  }
  const pattern = cells.slice(0, difficulty.marked);
  // A deterministic fallback avoids endless retries even with a constant random source.
  if (matchesPattern(pattern, previous)) pattern[0] = cells[difficulty.marked]!;
  return pattern.sort((left, right) => left - right);
}

export function toggleCell(selected: readonly number[], cell: number): number[] {
  return selected.includes(cell) ? selected.filter(value => value !== cell) : [...selected, cell];
}
