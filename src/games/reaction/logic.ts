import { REACTION_CONFIG } from './config';

export type ReactionPhase = 'choice' | 'ready' | 'waiting' | 'signal' | 'feedback' | 'ended';
export interface ReactionState {
  phase: ReactionPhase;
  practice: boolean;
  times: readonly number[];
  falseStarts: number;
  signalAt: number | null;
  lastTime: number | null;
  lastWasEarly: boolean;
}
export function createReaction(): ReactionState {
  return { phase: 'choice', practice: false, times: [], falseStarts: 0, signalAt: null, lastTime: null, lastWasEarly: false };
}
export function chooseReactionMode(state: ReactionState, practice: boolean): ReactionState {
  if (state.phase !== 'choice' && !(state.practice && state.phase === 'feedback')) return state;
  return { ...state, phase: 'ready', practice, lastTime: null, lastWasEarly: false };
}
export function beginTrial(state: ReactionState): ReactionState {
  if (state.times.length >= REACTION_CONFIG.validTrials || (state.phase !== 'ready' && !(state.phase === 'feedback' && !state.practice))) return state;
  return { ...state, phase: 'waiting', signalAt: null, lastTime: null, lastWasEarly: false };
}
export function showSignal(state: ReactionState, now: number): ReactionState {
  if (state.phase !== 'waiting' || !Number.isFinite(now)) return state;
  return { ...state, phase: 'signal', signalAt: now };
}
export function reactToSignal(state: ReactionState, now: number): ReactionState {
  if (state.phase === 'waiting') {
    const falseStarts = state.falseStarts + Number(!state.practice);
    return { ...state, phase: falseStarts >= REACTION_CONFIG.maximumFalseStarts ? 'ended' : 'feedback',
      falseStarts, signalAt: null, lastTime: null, lastWasEarly: true };
  }
  if (state.phase !== 'signal' || state.signalAt === null || !Number.isFinite(now) || now < state.signalAt) return state;
  const elapsed = now - state.signalAt;
  const times = state.practice ? state.times : [...state.times, elapsed];
  return { ...state, times, phase: 'feedback',
    signalAt: null, lastTime: elapsed, lastWasEarly: false };
}
/** Interrupted attempts never become measurements or false starts. */
export function interruptTrial(state: ReactionState): ReactionState {
  return state.phase === 'waiting' || state.phase === 'signal'
    ? { ...state, phase: 'ready', signalAt: null, lastTime: null, lastWasEarly: false }
    : state;
}
export function randomDelay(random: () => number): number {
  return REACTION_CONFIG.minimumDelayMs + Math.max(0, Math.min(1, random())) *
    (REACTION_CONFIG.maximumDelayMs - REACTION_CONFIG.minimumDelayMs);
}
export function median(times: readonly number[]): number {
  if (times.length === 0) return 0;
  const sorted = [...times].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle]! : (sorted[middle - 1]! + sorted[middle]!) / 2;
}
export function average(times: readonly number[]): number {
  return times.length ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
}
export function completeReaction(state: ReactionState): ReactionState {
  return state.phase === 'feedback' && isEligible(state) ? { ...state, phase: 'ended' } : state;
}
export function isEligible(state: ReactionState): boolean {
  return state.times.length === REACTION_CONFIG.validTrials && state.falseStarts < REACTION_CONFIG.maximumFalseStarts;
}
