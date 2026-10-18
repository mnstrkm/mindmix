export const RULE_VERSION = 1;
export const MIXED_RULE_VERSION = 2;
export const FEEDBACK_MS = 350;
export const PROGRESSION = {
  basic: [
    { from: 0, maximum: 20, factor: 5 },
    { from: 5, maximum: 50, factor: 5 },
    { from: 10, maximum: 100, factor: 10 },
  ],
  mixed: [
    { from: 0, maximum: 20, factor: 6 },
    { from: 5, maximum: 50, factor: 8 },
    { from: 10, maximum: 100, factor: 10 },
    { from: 18, maximum: 200, factor: 12 },
  ],
} as const;
