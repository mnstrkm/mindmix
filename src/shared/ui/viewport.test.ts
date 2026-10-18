import { beforeEach, expect, it, vi } from 'vitest';
import { focusAndReveal, revealRegion } from './viewport';

function region(top: number, bottom: number) {
  const element = document.createElement('button');
  vi.spyOn(element, 'getBoundingClientRect').mockReturnValue({ top, bottom } as DOMRect);
  return element;
}
beforeEach(() => {
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
  vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800);
  vi.spyOn(window, 'scrollY', 'get').mockReturnValue(100);
});

it('keeps a fully visible region in place', () => {
  revealRegion(region(100, 600));
  expect(window.scrollTo).not.toHaveBeenCalled();
});

it('includes the heading when the combined region fits the viewport', () => {
  revealRegion(region(400, 900), region(250, 300));
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 326, behavior: 'instant' });
});

it('starts a tall panel at the viewport margin and does not scroll it again when aligned', () => {
  revealRegion(region(250, 1400), region(100, 180));
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 326, behavior: 'instant' });
  vi.mocked(window.scrollTo).mockClear();
  revealRegion(region(24, 1174));
  expect(window.scrollTo).not.toHaveBeenCalled();
});

it('focuses without native scrolling before revealing the target', () => {
  const button = region(-50, 0);
  const focus = vi.spyOn(button, 'focus');
  focusAndReveal(button);
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(window.scrollTo).toHaveBeenCalledWith({ top: 26, behavior: 'instant' });
});
