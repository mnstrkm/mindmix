export const RULE_VERSION = 2;
export interface Difficulty { rows: number; columns: number; marked: number }
export const PROGRESSION: readonly Difficulty[] = [
  { rows: 2, columns: 2, marked: 2 },
  { rows: 3, columns: 2, marked: 2 },
  { rows: 3, columns: 2, marked: 3 },
  { rows: 3, columns: 3, marked: 3 },
  { rows: 3, columns: 3, marked: 4 },
  { rows: 4, columns: 3, marked: 4 },
  { rows: 4, columns: 3, marked: 5 },
  { rows: 4, columns: 4, marked: 5 },
  { rows: 4, columns: 4, marked: 6 },
  { rows: 4, columns: 4, marked: 7 },
  { rows: 4, columns: 4, marked: 8 },
  { rows: 5, columns: 4, marked: 8 },
  { rows: 5, columns: 4, marked: 9 },
  { rows: 6, columns: 4, marked: 10 },
  { rows: 6, columns: 4, marked: 12 },
  { rows: 7, columns: 4, marked: 13 },
  { rows: 8, columns: 4, marked: 14 },
  { rows: 8, columns: 4, marked: 16 },
];
// Solved patterns required for each level. Larger grids stay for several rounds.
export const LEVEL_THRESHOLDS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 21, 24, 27] as const;
