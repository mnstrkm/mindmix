import { RECOGNITION_CONFIG } from './config';

export type RecognitionAnswer = 'new' | 'repeat';
export interface WordPrompt { word: string; seenBefore: boolean }
export interface RecognitionState {
  seen: readonly string[];
  recent: readonly string[];
  prompt: WordPrompt;
  score: number;
  newCorrect: number;
  repeatCorrect: number;
  actions: number;
  ended: false | 'mistake' | 'completed';
}
export type Random = () => number;

function pick<T>(items: readonly T[], random: Random): T {
  if (items.length === 0) throw new Error('Cannot select from an empty word pool');
  return items[Math.min(items.length - 1, Math.max(0, Math.floor(random() * items.length)))]!;
}

/** The new/repeat decision is independent of which particular word is selected. */
export function decideRepeat(seenCount: number, random: Random): boolean {
  return seenCount > 0 && random() < RECOGNITION_CONFIG.repeatProbability;
}

export function selectPrompt(
  pool: readonly string[], seen: readonly string[], previous: string | undefined, random: Random, recent: readonly string[] = previous ? [previous] : [],
): WordPrompt | null {
  const seenSet = new Set(seen);
  const unseen = pool.filter(word => !seenSet.has(word));
  if (unseen.length === 0) return null;
  const repeat = decideRepeat(seen.length, random);
  if (!repeat) return { word: pick(unseen, random), seenBefore: false };
  const older = seen.filter(word => word !== previous);
  // With only one seen word there is no varied repeat to offer. Introduce a new
  // word instead of allowing the opening word to repeat indefinitely.
  if (older.length === 0) return { word: pick(unseen, random), seenBefore: false };
  const rested = older.filter(word => !recent.includes(word));
  const candidates = rested.length ? rested : older;
  const word = pick(candidates, random);
  return { word, seenBefore: seenSet.has(word) };
}

export function createRecognition(pool: readonly string[], random: Random = Math.random): RecognitionState {
  const prompt = selectPrompt(pool, [], undefined, random);
  if (!prompt) throw new Error('Recognition needs a nonempty word pool');
  return { seen: [prompt.word], recent: [prompt.word], prompt, score: 0, newCorrect: 0, repeatCorrect: 0, actions: 0, ended: false };
}

export function answerRecognition(
  state: RecognitionState, answer: RecognitionAnswer, pool: readonly string[], random: Random = Math.random,
): RecognitionState {
  if (state.ended) return state;
  const correct = (answer === 'repeat') === state.prompt.seenBefore;
  if (!correct) return { ...state, actions: state.actions + 1, ended: 'mistake' };
  const next = {
    ...state, score: state.score + Number(!state.prompt.seenBefore), actions: state.actions + 1,
    newCorrect: state.newCorrect + Number(!state.prompt.seenBefore),
    repeatCorrect: state.repeatCorrect + Number(state.prompt.seenBefore),
  };
  const prompt = selectPrompt(pool, state.seen, state.prompt.word, random, state.recent);
  if (!prompt) return { ...next, ended: 'completed' };
  // Its status was checked above, before it becomes part of the seen set.
  return { ...next, prompt, recent: [...state.recent, prompt.word].slice(-RECOGNITION_CONFIG.recentWindow), seen: prompt.seenBefore ? state.seen : [...state.seen, prompt.word] };
}
