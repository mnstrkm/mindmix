import type { ReactNode } from 'react';

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
  /** Additional independent records, using the game's existing score direction. */
  recordScores?: Record<string, number>;
  /** Ephemeral game-owned feedback, never written to saved history or records. */
  review?: ReactNode;
}
export interface GameProps {
  language: Language;
  variant: string;
  paused: boolean;
  onProgress: (result: GameResult) => void;
  onFinish: (result: GameResult) => void;
}
