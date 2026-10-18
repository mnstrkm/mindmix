import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, expect, it, vi } from 'vitest';
import { audio } from './audio';
import { UiSounds } from './UiSounds';

vi.mock('./audio', () => ({ audio: { unlock: vi.fn(), play: vi.fn() } }));
beforeEach(() => { vi.mocked(audio.play).mockClear(); vi.mocked(audio.unlock).mockClear(); });

it('plays one UI tick for nested button content, links, summaries and checkbox labels', () => {
  render(<><UiSounds /><button><span>Action</span></button><a href="#test">Link</a><details><summary>Details</summary></details><label>Toggle<input type="checkbox" /></label></>);
  for (const element of [screen.getByText('Action'), screen.getByText('Link'), screen.getByText('Details'), screen.getByText('Toggle')]) fireEvent.click(element);
  expect(audio.play).toHaveBeenCalledTimes(4);
  expect(audio.play).toHaveBeenNthCalledWith(1, 'ui');
});

it('does not layer a UI tick over game feedback or accept disabled controls', () => {
  render(<><UiSounds /><div data-ui-sound="off"><button onClick={() => audio.play('simon0')}>Color</button></div><button disabled>Disabled</button><button aria-disabled="true">Locked</button></>);
  fireEvent.click(screen.getByText('Color'));
  fireEvent.click(screen.getByText('Disabled'));
  fireEvent.click(screen.getByText('Locked'));
  expect(audio.play).toHaveBeenCalledExactlyOnceWith('simon0');
});

it('uses changes for sliders and removes document handlers on unmount', () => {
  const view = render(<><UiSounds /><input type="range" aria-label="Volume" /></>);
  fireEvent.click(screen.getByRole('slider'));
  expect(audio.play).not.toHaveBeenCalled();
  fireEvent.change(screen.getByRole('slider'), { target: { value: 60 } });
  expect(audio.play).toHaveBeenCalledExactlyOnceWith('ui');
  view.unmount();
  const button = document.createElement('button');
  document.body.append(button);
  fireEvent.click(button);
  expect(audio.play).toHaveBeenCalledTimes(1);
  button.remove();
});
