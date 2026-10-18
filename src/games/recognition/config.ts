export const RULE_VERSION = 2;
export const CONTENT_VERSION = 1;
export const RECOGNITION_CONFIG = {
  repeatProbability: 0.45,
  immediateRepeatProbability: 0.06,
  maximumIdenticalRun: 2,
  recentWindow: 4,
  inputGuardMs: 260,
} as const;
