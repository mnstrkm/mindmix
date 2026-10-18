export const RULE_VERSION = 1;
export const FEEDBACK_MS = 350;
export const PROGRESSION = [
  { from: 0, rows: 2, columns: 2, distractors: 'opposite' },
  { from: 4, rows: 3, columns: 2, distractors: 'opposite' },
  { from: 8, rows: 3, columns: 3, distractors: 'opposite' },
  { from: 12, rows: 4, columns: 3, distractors: 'opposite' },
  { from: 16, rows: 4, columns: 4, distractors: 'opposite' },
  { from: 20, rows: 4, columns: 4, distractors: 'cardinal' },
  { from: 24, rows: 4, columns: 4, distractors: 'all' },
] as const;
