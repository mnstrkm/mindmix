export const gameIds = ['recognition', 'digits', 'simon', 'spatial', 'arithmetic', 'search', 'switch', 'reaction'] as const;
export type GameId = typeof gameIds[number];
export type Language = 'de' | 'tr';
export type EndReason = 'mistake' | 'completed' | 'stopped' | 'false-starts';
export interface GameResult {
  score: number;
  actions: number;
  stats?: Record<string, number | string>;
  reason?: EndReason;
  eligible?: boolean;
}
export interface GameProps {
  language: Language;
  variant: string;
  paused: boolean;
  onProgress: (result: GameResult) => void;
  onFinish: (result: GameResult) => void;
}
