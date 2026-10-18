import { describe, expect, it } from 'vitest';
import { completedScore, createSequence, matchesSequence } from './logic';

describe('digit sequences', () => {
  it('preserves leading zeroes and repeated digits', () => {
    const samples = [0, 0, 0.9, 0.9];
    expect(createSequence(4, () => samples.shift()!)).toBe('0099');
    expect(matchesSequence('0099', '0099')).toBe(true);
    expect(matchesSequence('0099', '99')).toBe(false);
  });

  it('requires the complete sequence in the correct order', () => {
    expect(matchesSequence('123', '132')).toBe(false);
    expect(matchesSequence('123', '12')).toBe(false);
    expect(matchesSequence('123', '1234')).toBe(false);
  });

  it('scores only a completely solved sequence', () => {
    expect(completedScore(2, '013', '013')).toBe(3);
    expect(completedScore(2, '013', '031')).toBe(2);
  });

  it('generates every position anew', () => {
    expect(createSequence(2, () => 0.1)).toBe('11');
    expect(createSequence(3, () => 0.8)).toBe('888');
  });
});
