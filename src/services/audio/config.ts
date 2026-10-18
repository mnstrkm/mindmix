export const effectNames = ['click', 'correct', 'error', 'record', 'simon0', 'simon1', 'simon2', 'simon3'] as const;
export type Sound = typeof effectNames[number];
// Paths are relative to public/. Missing files are tried once, then synthesized.
export const audioConfig: { effects: Partial<Record<Sound, string>>; music?: string } = { effects: {} };
