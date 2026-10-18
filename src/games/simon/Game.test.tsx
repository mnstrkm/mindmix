import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { audio } from '../../services/audio/audio';
import { INPUT_FEEDBACK_MS, PRESENTATION_DELAY_MS, SIGNAL_DURATION_MS, SIGNAL_GAP_MS } from './config';
import Game from './Game';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../../services/audio/audio', () => ({ audio: { play: vi.fn(), stopEffects: vi.fn() } }));
const presentationTime = PRESENTATION_DELAY_MS + 2 * (SIGNAL_DURATION_MS + SIGNAL_GAP_MS);

describe('Simon presentation and interruption', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.mocked(audio.play).mockClear();
  });
  afterEach(() => { vi.useRealTimers(); });

  it('ignores presentation inputs, separates identical cues, and scores complete sequences only', () => {
    const onProgress = vi.fn();
    render(<Game paused={false} language="de" variant="default" onProgress={onProgress} onFinish={vi.fn()} />);
    const pad = screen.getByRole('button', { name: 'pad0' });
    expect(pad).toBeDisabled();
    act(() => vi.advanceTimersByTime(PRESENTATION_DELAY_MS));
    expect(pad).toHaveClass('active');
    act(() => vi.advanceTimersByTime(SIGNAL_DURATION_MS));
    expect(pad).not.toHaveClass('active');
    act(() => vi.advanceTimersByTime(SIGNAL_GAP_MS));
    expect(pad).toHaveClass('active');
    act(() => vi.advanceTimersByTime(SIGNAL_DURATION_MS + SIGNAL_GAP_MS));
    expect(pad).toBeEnabled();
    fireEvent.click(pad);
    fireEvent.click(pad);
    expect(onProgress).toHaveBeenCalledTimes(2);
    act(() => vi.advanceTimersByTime(INPUT_FEEDBACK_MS));
    fireEvent.click(pad, { detail: 2 });
    expect(onProgress).toHaveBeenCalledTimes(2);
    fireEvent.click(pad);
    expect(onProgress).toHaveBeenLastCalledWith({ score: 2, actions: 2, stats: { 'stats.completedRounds': 1 } });
  });

  it('cancels a presentation on pause, starts it over on resume, and removes timers on unmount', () => {
    const props = { language: 'de' as const, variant: 'default', onProgress: vi.fn(), onFinish: vi.fn() };
    const view = render(<Game {...props} paused={false} />);
    act(() => vi.advanceTimersByTime(PRESENTATION_DELAY_MS));
    expect(audio.play).toHaveBeenCalledTimes(1);
    view.rerender(<Game {...props} paused />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(audio.play).toHaveBeenCalledTimes(1);
    view.rerender(<Game {...props} paused={false} />);
    act(() => vi.advanceTimersByTime(presentationTime));
    expect(audio.play).toHaveBeenCalledTimes(3);
    expect(screen.getByRole('button', { name: 'pad0' })).toBeEnabled();
    act(() => vi.advanceTimersByTime(0));
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('never replays after a valid input and preserves the next required position', () => {
    const onProgress = vi.fn();
    const props = { language: 'de' as const, variant: 'default', onProgress, onFinish: vi.fn() };
    const view = render(<Game {...props} paused={false} />);
    act(() => vi.advanceTimersByTime(presentationTime));
    fireEvent.click(screen.getByRole('button', { name: 'pad0' }));
    const soundCount = vi.mocked(audio.play).mock.calls.length;
    view.rerender(<Game {...props} paused />);
    view.rerender(<Game {...props} paused={false} />);
    act(() => vi.advanceTimersByTime(10_000));
    expect(audio.play).toHaveBeenCalledTimes(soundCount);
    fireEvent.click(screen.getByRole('button', { name: 'pad0' }));
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 2, actions: 2 }));
  });
});
