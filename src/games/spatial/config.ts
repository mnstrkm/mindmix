export const RULE_VERSION = 1;
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
];
