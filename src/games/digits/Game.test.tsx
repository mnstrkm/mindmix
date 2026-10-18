import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Game from './Game';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('../../services/audio/audio', () => ({ audio: { play: vi.fn() } }));

describe('digit recall interaction', () => {
  beforeEach(() => { vi.spyOn(Math, 'random').mockReturnValue(0); });

  it('removes the template from the DOM, accepts leading zeroes, and publishes completed length', () => {
    const onProgress = vi.fn();
    render(<Game paused={false} language="de" variant="default" onProgress={onProgress} onFinish={vi.fn()} />);
    expect(screen.getByLabelText('sequence')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'hide' }));
    expect(screen.queryByLabelText('sequence')).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    fireEvent.click(screen.getByRole('button', { name: '0' }));
    expect(screen.getByLabelText('answer')).toHaveTextContent('00');
    fireEvent.click(screen.getAllByRole('button', { name: 'confirm' })[0]!);
    expect(onProgress).toHaveBeenLastCalledWith({ score: 2, actions: 1, stats: { 'stats.completedRounds': 1 } });
    expect(screen.getByLabelText('sequence').querySelectorAll('span')).toHaveLength(3);
  });

  it('keeps the memory template hidden through a pause and finalizes a wrong answer once', () => {
    const onFinish = vi.fn();
    const props = { language: 'de' as const, variant: 'default', onProgress: vi.fn(), onFinish };
    const view = render(<Game {...props} paused={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'hide' }));
    view.rerender(<Game {...props} paused />);
    expect(screen.queryByLabelText('sequence')).not.toBeInTheDocument();
    view.rerender(<Game {...props} paused={false} />);
    fireEvent.click(screen.getByRole('button', { name: '1' }));
    const confirm = screen.getAllByRole('button', { name: 'confirm' })[0]!;
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledWith(expect.objectContaining({ score: 0, actions: 1, reason: 'mistake' }));
  });
});
