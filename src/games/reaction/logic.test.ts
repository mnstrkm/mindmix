import { describe, expect, it } from 'vitest';
import { beginTrial, chooseReactionMode, createReaction, interruptTrial, isEligible, median, randomDelay, reactToSignal, showSignal } from './logic';

const measured = () => chooseReactionMode(createReaction(), false);

describe('reaction rules', () => {
  it('runs five valid measurements and uses the median instead of the fastest', () => {
    let state = measured();
    for (const elapsed of [280, 150, 410, 230, 320]) {
      state = reactToSignal(showSignal(beginTrial(state), 1000), 1000 + elapsed);
    }
    expect(state.phase).toBe('ended');
    expect(state.times).toEqual([280, 150, 410, 230, 320]);
    expect(median(state.times)).toBe(280);
    expect(isEligible(state)).toBe(true);
    expect(reactToSignal(state, 2000)).toBe(state);
  });

  it('requires five values for eligibility and counts three false starts without fabricated times', () => {
    let state = reactToSignal(showSignal(beginTrial(measured()), 1000), 1200);
    expect(isEligible(state)).toBe(false);
    for (let count = 0; count < 3; count++) state = reactToSignal(beginTrial(state), 3000);
    expect(state).toMatchObject({ phase: 'ended', falseStarts: 3, times: [200] });
    expect(isEligible(state)).toBe(false);
  });

  it('does not score practice results or practice false starts', () => {
    const practice = chooseReactionMode(createReaction(), true);
    const success = reactToSignal(showSignal(beginTrial(practice), 100), 300);
    expect(success).toMatchObject({ phase: 'feedback', times: [], falseStarts: 0, lastTime: 200 });
    const early = reactToSignal(beginTrial(practice), 150);
    expect(early).toMatchObject({ phase: 'feedback', times: [], falseStarts: 0, lastWasEarly: true });
    expect(chooseReactionMode(success, false)).toMatchObject({ phase: 'ready', practice: false, times: [] });
  });

  it('discards interrupted waiting and signal phases without changing prior results', () => {
    const recorded = reactToSignal(showSignal(beginTrial(measured()), 100), 300);
    const waiting = beginTrial(recorded);
    for (const active of [waiting, showSignal(waiting, 1000)]) {
      const interrupted = interruptTrial(active);
      expect(interrupted).toMatchObject({ phase: 'ready', times: [200], falseStarts: 0, signalAt: null });
      expect(reactToSignal(interrupted, 1500)).toBe(interrupted);
    }
  });

  it('rejects invalid timestamps and signals from the wrong phase', () => {
    const ready = measured();
    expect(showSignal(ready, 10)).toBe(ready);
    const waiting = beginTrial(ready);
    expect(showSignal(waiting, NaN)).toBe(waiting);
    const signal = showSignal(waiting, 100);
    expect(reactToSignal(signal, 99)).toBe(signal);
    expect(reactToSignal(signal, Infinity)).toBe(signal);
    expect(reactToSignal(signal, 150)).toMatchObject({ times: [50] });
  });

  it('has bounded random waiting times and a pure numerical median', () => {
    expect(randomDelay(() => 0)).toBe(2000);
    expect(randomDelay(() => 1)).toBe(5000);
    expect(randomDelay(() => 0.5)).toBe(3500);
    const values = [1000, 90, 100];
    expect(median(values)).toBe(100);
    expect(values).toEqual([1000, 90, 100]);
    expect(median([100, 200])).toBe(150);
  });
});
