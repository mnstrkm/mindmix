import { fireEvent, render, screen, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Game from './Game';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../../services/audio/audio', () => ({ audio: { play: vi.fn() } }));

describe('spatial recall interaction', () => {
  beforeEach(() => { vi.spyOn(Math, 'random').mockReturnValue(0); });

  it('hides all original marks, permits corrections, and advances only after confirmation', () => {
    const onProgress = vi.fn();
    render(<Game paused={false} language="de" variant="default" onProgress={onProgress} onFinish={vi.fn()} />);
    const cells = within(screen.getByRole('group')).getAllByRole('button');
    const marked = cells.map((cell, index) => cell.classList.contains('marked') ? index : -1).filter(index => index >= 0);
    fireEvent.click(screen.getByRole('button', { name: 'hide' }));
    expect(screen.queryAllByLabelText('markedCell')).toHaveLength(0);
    expect(screen.getByRole('group').querySelectorAll('svg')).toHaveLength(0);
    for (const index of marked) fireEvent.click(cells[index]!);
    fireEvent.click(cells[marked[0]!]!);
    fireEvent.click(cells[marked[0]!]!);
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 0, actions: 0 }));
    fireEvent.click(screen.getByRole('button', { name: 'confirm' }));
    expect(onProgress).toHaveBeenLastCalledWith(expect.objectContaining({ score: 1, actions: 1 }));
    expect(within(screen.getByRole('group')).getAllByRole('button')).toHaveLength(6);
  });

  it('does not expose the pattern on pause and counts a wrong confirmation once', () => {
    const onFinish = vi.fn();
    const props = { language: 'de' as const, variant: 'default', onProgress: vi.fn(), onFinish };
    const view = render(<Game {...props} paused={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'hide' }));
    view.rerender(<Game {...props} paused />);
    expect(screen.queryAllByLabelText('markedCell')).toHaveLength(0);
    view.rerender(<Game {...props} paused={false} />);
    const confirm = screen.getByRole('button', { name: 'confirm' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith(expect.objectContaining({ score: 0, actions: 1, reason: 'mistake' }));
  });
});
