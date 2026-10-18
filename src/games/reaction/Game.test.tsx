import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { audio } from '../../services/audio/audio';
import { REACTION_CONFIG } from './config';
import Game from './Game';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../../services/audio/audio', () => ({ audio: { play: vi.fn() } }));

let clock = 0;
function advance(milliseconds: number) {
  clock += milliseconds;
  act(() => vi.advanceTimersByTime(milliseconds));
}
function pointer(target: HTMLElement, properties = { isPrimary: true, button: 0 }) {
  const event = new Event('pointerdown', { bubbles: true, cancelable: true });
  Object.assign(event, properties);
  fireEvent(target, event);
}
function startMeasured() {
  fireEvent.click(screen.getByRole('button', { name: 'skipPractice' }));
  fireEvent.click(screen.getByRole('button', { name: 'startTrial' }));
}

describe('reaction interaction', () => {
  beforeEach(() => {
    clock = 0;
    vi.useFakeTimers();
    vi.spyOn(performance, 'now').mockImplementation(() => clock);
    vi.spyOn(Math, 'random').mockReturnValue(0);
    vi.mocked(audio.play).mockClear();
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => window.setTimeout(() => callback(clock), 16));
    vi.stubGlobal('cancelAnimationFrame', (id: number) => window.clearTimeout(id));
  });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

  it('keeps the last response visible and reports average and fastest separately after confirmation', () => {
    const onFinish = vi.fn();
    render(<Game paused={false} language="de" variant="default" onProgress={vi.fn()} onFinish={onFinish} />);
    startMeasured();
    const times = [300, 100, 500, 230, 200];
    for (const [index, time] of times.entries()) {
      advance(REACTION_CONFIG.minimumDelayMs + 16);
      const target = screen.getByRole('button', { name: 'nowLabel' });
      if (index === 0) expect(audio.play).not.toHaveBeenCalled();
      advance(time);
      if (index % 2 === 0) pointer(target);
      else fireEvent.keyDown(target, { key: index === 1 ? 'Enter' : ' ' });
      fireEvent.click(target);
      if (index < times.length - 1) {
        expect(onFinish).not.toHaveBeenCalled();
        expect(screen.getByRole('button', { name: 'nextTrial' })).toHaveFocus();
        advance(REACTION_CONFIG.inputGuardMs);
        fireEvent.click(screen.getByRole('button', { name: 'nextTrial' }));
      }
    }
    expect(onFinish).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'showResult' })).toBeVisible();
    advance(60_000);
    expect(onFinish).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'showResult' }));
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith(expect.objectContaining({ score: 266, actions: 5, eligible: true, reason: 'completed', recordScores: { fastest: 100 }, stats: {
      'stats.validTrials': 5, 'stats.falseStarts': 0, 'stats.average': 266, 'stats.fastest': 100, 'stats.measurements': '300 · 100 · 500 · 230 · 200',
    } }));
  });

  it('ignores non-primary pointers, key repeats and clicks, but ends after three genuine false starts', () => {
    const onFinish = vi.fn();
    const onProgress = vi.fn();
    render(<Game paused={false} language="de" variant="default" onProgress={onProgress} onFinish={onFinish} />);
    startMeasured();
    const target = screen.getByRole('button', { name: 'waitingLabel' });
    pointer(target, { isPrimary: false, button: 0 });
    pointer(target, { isPrimary: true, button: 2 });
    fireEvent.keyDown(target, { key: 'Enter', repeat: true });
    fireEvent.click(target);
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ actions: 0 }));
    for (let attempt = 0; attempt < 3; attempt++) {
      fireEvent.keyDown(screen.getByRole('button', { name: 'waitingLabel' }), { key: 'Enter' });
      if (attempt < 2) {
        advance(REACTION_CONFIG.inputGuardMs);
        fireEvent.click(screen.getByRole('button', { name: 'nextTrial' }));
      }
    }
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith(expect.objectContaining({ score: 0, actions: 3, eligible: false, reason: 'false-starts' }));
  });

  it('discards both waiting and visible signals on pause and clears pending work on unmount', () => {
    const props = { language: 'de' as const, variant: 'default', onProgress: vi.fn(), onFinish: vi.fn() };
    const view = render(<Game {...props} paused={false} />);
    startMeasured();
    advance(1000);
    view.rerender(<Game {...props} paused />);
    advance(10_000);
    expect(screen.queryByRole('button', { name: 'nowLabel' })).not.toBeInTheDocument();
    view.rerender(<Game {...props} paused={false} />);
    expect(screen.getByText('interrupted')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'startTrial' }));
    advance(REACTION_CONFIG.minimumDelayMs + 16);
    expect(screen.getByRole('button', { name: 'nowLabel' })).toBeInTheDocument();
    view.rerender(<Game {...props} paused />);
    view.rerender(<Game {...props} paused={false} />);
    expect(props.onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ actions: 0, eligible: false }));
    fireEvent.click(screen.getByRole('button', { name: 'startTrial' }));
    advance(0);
    view.unmount();
    advance(0);
    expect(vi.getTimerCount()).toBe(0);
    advance(10_000);
    expect(props.onFinish).not.toHaveBeenCalled();
    expect(audio.play).not.toHaveBeenCalled();
  });

  it('leaves optional practice out of measured results', () => {
    const onProgress = vi.fn();
    render(<Game paused={false} language="de" variant="default" onProgress={onProgress} onFinish={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'practice' }));
    fireEvent.click(screen.getByRole('button', { name: 'startPractice' }));
    advance(REACTION_CONFIG.minimumDelayMs + 16);
    advance(200);
    pointer(screen.getByRole('button', { name: 'nowLabel' }));
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 0, actions: 0, eligible: false }));
    fireEvent.click(screen.getByRole('button', { name: 'startMeasured' }));
    expect(screen.getByRole('button', { name: 'startTrial' })).toHaveFocus();
  });
});
