import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameProps } from '../../app/types';
import { FEEDBACK_MS } from './config';
import Game from './Game';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => values ? `${key} ${JSON.stringify(values)}` : key }) }));
vi.mock('../../services/audio/audio', () => ({ audio: { play: vi.fn() } }));

describe('search interactions', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.spyOn(Math, 'random').mockReturnValue(0); });
  afterEach(() => { vi.useRealTimers(); });
  function props(): GameProps { return { language: 'de', variant: 'default', paused: false, onProgress: vi.fn(), onFinish: vi.fn() }; }

  it('counts a correct answer once and freezes feedback when paused', () => {
    const callbacks = props();
    const { rerender, unmount } = render(<Game {...callbacks} />);
    const first = screen.getAllByRole('button')[0]!;
    fireEvent.click(first);
    fireEvent.click(first);
    expect(first).toHaveClass('selected');
    expect(callbacks.onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 1, actions: 1 }));
    expect(callbacks.onFinish).not.toHaveBeenCalled();
    rerender(<Game {...callbacks} paused />);
    act(() => { vi.advanceTimersByTime(FEEDBACK_MS * 2); });
    expect(first).toBeDisabled();
    rerender(<Game {...callbacks} />);
    act(() => { vi.advanceTimersByTime(FEEDBACK_MS); });
    expect(first).toBeEnabled();
    expect(first).not.toHaveClass('selected');
    fireEvent.click(first, { detail: 2 });
    expect(callbacks.onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 1 }));
    fireEvent.click(first, { detail: 1 });
    expect(callbacks.onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 2 }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('finalizes a wrong choice only once', () => {
    const callbacks = props();
    render(<Game {...callbacks} />);
    const wrong = screen.getAllByRole('button')[1]!;
    fireEvent.click(wrong);
    fireEvent.click(wrong);
    expect(callbacks.onFinish).toHaveBeenCalledTimes(1);
    expect(callbacks.onFinish).toHaveBeenCalledWith(expect.objectContaining({ score: 0, actions: 1, reason: 'mistake' }));
  });
});
