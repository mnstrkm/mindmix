import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RECOGNITION_CONFIG } from './config';
import Game from './Game';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../../services/audio/audio', () => ({ audio: { play: vi.fn() } }));
vi.mock('./words', () => ({ words: { de: ['Apfel', 'Birne', 'Kirsche'], tr: ['elma', 'armut', 'kiraz'] } }));

describe('recognition interaction', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.spyOn(Math, 'random').mockReturnValue(0); });
  afterEach(() => { vi.useRealTimers(); });

  it('scores new and repeat choices, rejects duplicate clicks, and finalizes an error once', () => {
    const onProgress = vi.fn();
    const onFinish = vi.fn();
    render(<Game paused={false} language="de" variant="default" onProgress={onProgress} onFinish={onFinish} />);
    const newButton = screen.getByRole('button', { name: 'new' });
    fireEvent.click(newButton);
    fireEvent.click(newButton);
    expect(onFinish).not.toHaveBeenCalled();
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 1, actions: 1, stats: { 'stats.newWords': 1, 'stats.repeats': 0 } }));
    act(() => vi.advanceTimersByTime(RECOGNITION_CONFIG.inputGuardMs));
    fireEvent.click(newButton, { detail: 2 });
    expect(onFinish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'repeat' }));
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 2, actions: 2, stats: { 'stats.newWords': 1, 'stats.repeats': 1 } }));
    act(() => vi.advanceTimersByTime(RECOGNITION_CONFIG.inputGuardMs));
    fireEvent.click(newButton);
    fireEvent.click(newButton);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith(expect.objectContaining({ score: 2, actions: 3, reason: 'mistake' }));
  });

  it('cancels input timers on pause and freezes the original word pool', () => {
    const props = { variant: 'default', onProgress: vi.fn(), onFinish: vi.fn() };
    const view = render(<Game {...props} language="de" paused={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'new' }));
    view.rerender(<Game {...props} language="tr" paused />);
    act(() => vi.advanceTimersByTime(0));
    expect(vi.getTimerCount()).toBe(0);
    expect(screen.getByLabelText('promptLabel')).toHaveTextContent('Apfel');
    fireEvent.click(screen.getByRole('button', { name: 'new' }));
    expect(props.onFinish).not.toHaveBeenCalled();
    view.rerender(<Game {...props} language="tr" paused={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'repeat' }));
    expect(props.onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 2, actions: 2 }));
    view.unmount();
    act(() => vi.advanceTimersByTime(0));
    expect(vi.getTimerCount()).toBe(0);
  });
});
