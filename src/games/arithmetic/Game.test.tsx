import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameProps } from '../../app/types';
import Game from './Game';
import { FEEDBACK_MS } from './config';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string, values?: Record<string, unknown>) => values ? `${key} ${JSON.stringify(values)}` : key }) }));
vi.mock('../../services/audio/audio', () => ({ audio: { play: vi.fn() } }));

describe('arithmetic interactions', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.spyOn(Math, 'random').mockReturnValue(0); });
  afterEach(() => { vi.useRealTimers(); });
  function props(): GameProps { return { language: 'de', variant: 'basic', paused: false, onProgress: vi.fn(), onFinish: vi.fn() }; }

  it('requires confirmation, allows correction, and starts a new task after success', () => {
    const callbacks = props();
    render(<Game {...callbacks} />);
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    expect(callbacks.onFinish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'backspace' }));
    fireEvent.click(screen.getByRole('button', { name: '4' }));
    const confirm = screen.getByRole('button', { name: 'confirm' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(callbacks.onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 1 }));
    expect(callbacks.onFinish).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(FEEDBACK_MS); });
    expect(screen.getByLabelText('answer')).not.toHaveTextContent('4');
    fireEvent.click(screen.getByRole('button', { name: '2' }));
    fireEvent.click(confirm);
    expect(callbacks.onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 2 }));
  });
  it('finishes once with the correct solution after a confirmed wrong result', () => {
    const callbacks = props();
    render(<Game {...callbacks} />);
    fireEvent.click(screen.getByRole('button', { name: '5' }));
    const confirm = screen.getByRole('button', { name: 'confirm' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(callbacks.onFinish).toHaveBeenCalledTimes(1);
    expect(callbacks.onFinish).toHaveBeenCalledWith(expect.objectContaining({ score: 0, actions: 1, reason: 'mistake', stats: expect.objectContaining({ 'stats.solution': '2 + 2 = 4' }) }));
  });
});
