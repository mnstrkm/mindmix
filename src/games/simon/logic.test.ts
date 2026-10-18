import { describe, expect, it } from 'vitest';
import { checkSignal, createSequence, extendSequence } from './logic';

describe('Simon sequences', () => {
  it('starts with two independent signals and permits repeated signals', () => {
    expect(createSequence(2, () => 0)).toEqual([0, 0]);
  });

  it('extends the same sequence by exactly one signal without mutation', () => {
    const sequence = [0, 3, 3] as const;
    expect(extendSequence(sequence, () => 0.6)).toEqual([0, 3, 3, 2]);
    expect(sequence).toEqual([0, 3, 3]);
  });

  it('requires ordered input and completes only the last matching signal', () => {
    expect(checkSignal([0, 2, 2], 0, 0)).toBe('continue');
    expect(checkSignal([0, 2, 2], 1, 2)).toBe('continue');
    expect(checkSignal([0, 2, 2], 2, 2)).toBe('complete');
    expect(checkSignal([0, 2, 2], 0, 2)).toBe('wrong');
    expect(checkSignal([0, 2, 2], 3, 2)).toBe('wrong');
  });
});
