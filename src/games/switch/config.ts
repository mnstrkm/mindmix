export const RULE_VERSION = 1;
export const FEEDBACK_MS = 350;
export const INTRO_BLOCK_LENGTH = 4;
export const PROGRESSION = [
  { from: 8, switchProbability: 0.25 },
  { from: 16, switchProbability: 0.4 },
  { from: 24, switchProbability: 0.5 },
] as const;
