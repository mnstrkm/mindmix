import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameProps } from '../../app/types';
import Game from './Game';
import { FEEDBACK_MS } from './config';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => values ? `${key} ${JSON.stringify(values)}` : key }) }));
vi.mock('../../services/audio/audio', () => ({ audio: { play: vi.fn() } }));

describe('switch interactions', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.spyOn(Math, 'random').mockReturnValue(0); });
  afterEach(() => { vi.useRealTimers(); });
  function props(): GameProps { return { language: 'de', variant: 'default', paused: false, onProgress: vi.fn(), onFinish: vi.fn() }; }

  it('keeps answer positions fixed and reports correctly answered rule changes', () => {
    const callbacks = props();
    render(<Game {...callbacks} />);
    for (let i = 0; i < 5; i += 1) {
      expect(screen.getAllByRole('button')[0]).toHaveTextContent('left');
      fireEvent.click(screen.getByRole('button', { name: 'left' }));
      act(() => { vi.advanceTimersByTime(FEEDBACK_MS); });
    }
    expect(callbacks.onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 5, stats: expect.objectContaining({ 'stats.switches': 1 }) }));
    expect(screen.getByText(/colorLabel/)).toBeInTheDocument();
    expect(callbacks.onFinish).not.toHaveBeenCalled();
  });
  it('ignores paused input and finalizes a wrong decision once', () => {
    const callbacks = props();
    const { rerender } = render(<Game {...callbacks} paused />);
    fireEvent.click(screen.getByRole('button', { name: 'right' }));
    expect(callbacks.onFinish).not.toHaveBeenCalled();
    rerender(<Game {...callbacks} />);
    fireEvent.click(screen.getByRole('button', { name: 'right' }));
    fireEvent.click(screen.getByRole('button', { name: 'right' }));
    expect(callbacks.onFinish).toHaveBeenCalledTimes(1);
    expect(callbacks.onFinish).toHaveBeenCalledWith(expect.objectContaining({ score: 0, actions: 1, reason: 'mistake' }));
  });
});
