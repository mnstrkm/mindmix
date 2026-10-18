import { describe, expect, it, vi } from 'vitest';
import { answerRecognition, createRecognition, decideRepeat, selectPrompt } from './logic';
import { normalizeWord, words } from './words';

const sample = (...values: number[]) => () => values.shift() ?? 0;

describe('recognition rules', () => {
  it('checks new status before adding the first word to seen', () => {
    const state = createRecognition(['Apfel', 'Birne'], () => 0);
    expect(state.prompt).toEqual({ word: 'Apfel', seenBefore: false });
    expect(state.seen).toEqual(['Apfel']);
    expect(answerRecognition(state, 'new', ['Apfel', 'Birne'], sample(0.9, 0)).prompt).toEqual({ word: 'Birne', seenBefore: false });
  });

  it('separates repeat decisions from word selection and permits early repeated repeats', () => {
    const random = vi.fn(() => 0);
    expect(decideRepeat(0, random)).toBe(false);
    expect(random).not.toHaveBeenCalled();
    expect(decideRepeat(1, () => 0.44)).toBe(true);
    expect(decideRepeat(1, () => 0.45)).toBe(false);
    const pool = ['Apfel', 'Birne'];
    let state = answerRecognition(createRecognition(pool, () => 0), 'new', pool, () => 0);
    expect(state.prompt).toEqual({ word: 'Apfel', seenBefore: true });
    state = answerRecognition(state, 'repeat', pool, () => 0);
    state = answerRecognition(state, 'repeat', pool, () => 0);
    expect(state).toMatchObject({ score: 3, newCorrect: 1, repeatCorrect: 2, actions: 3, ended: false });
  });

  it('keeps old words seen and can choose longer or immediate repetition gaps', () => {
    const pool = ['Apfel', 'Birne', 'Pflaume', 'Kirsche'];
    const seen = ['Apfel', 'Birne', 'Pflaume'];
    expect(selectPrompt(pool, seen, 'Pflaume', sample(0, 0.9, 0))).toEqual({ word: 'Apfel', seenBefore: true });
    expect(selectPrompt(pool, seen, 'Pflaume', sample(0, 0, 0))).toEqual({ word: 'Pflaume', seenBefore: true });
    expect(selectPrompt(pool, seen, 'Pflaume', sample(0.9, 0))).toEqual({ word: 'Kirsche', seenBefore: false });
  });

  it('ends on first error without awarding a point or accepting later answers', () => {
    const pool = ['Apfel', 'Birne'];
    const failed = answerRecognition(createRecognition(pool, () => 0), 'repeat', pool);
    expect(failed).toMatchObject({ score: 0, actions: 1, ended: 'mistake' });
    expect(answerRecognition(failed, 'new', pool)).toBe(failed);
  });

  it('finishes only after the last unseen word was correctly judged without resetting history', () => {
    const pool = ['Apfel', 'Birne'];
    const second = answerRecognition(createRecognition(pool, () => 0), 'new', pool, sample(0.9, 0));
    expect(second.ended).toBe(false);
    const completed = answerRecognition(second, 'new', pool, () => 0);
    expect(completed).toMatchObject({ score: 2, actions: 2, newCorrect: 2, ended: 'completed' });
    expect(completed.seen).toEqual(pool);
    expect(selectPrompt(pool, pool, 'Birne', () => 0)).toBeNull();
  });
});

describe('word pool integrity', () => {
  for (const language of ['de', 'tr'] as const) {
    it(`${language}: at least 1000 NFC words, no locale duplicates or malformed tokens`, () => {
      const pool = words[language];
      expect(pool.length).toBeGreaterThanOrEqual(1000);
      expect(new Set(pool.map(word => normalizeWord(word, language))).size).toBe(pool.length);
      for (const word of pool) {
        expect(word).toBe(word.normalize('NFC'));
        expect(word).toMatch(/^\p{L}+(?:-\p{L}+)*$/u);
      }
    });
  }

  it('uses Turkish casing for dotted and dotless I', () => {
    expect(normalizeWord('IŞIK', 'tr')).toBe('ışık');
    expect(normalizeWord('İNCİR', 'tr')).toBe('incir');
    expect(normalizeWord('Tu\u0308r', 'de')).toBe('tür');
  });
});
