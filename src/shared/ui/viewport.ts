/** Reveal content using its measured size; large panels start below a small viewport margin. */
export function revealRegion(region: HTMLElement | null | undefined, context?: HTMLElement | null) {
  if (!region) return;
  const bounds = region.getBoundingClientRect();
  const margin = Math.min(24, window.innerHeight * 0.035);
  const available = window.innerHeight - margin * 2;
  const contextTop = context?.getBoundingClientRect().top;
  const top = contextTop !== undefined && bounds.bottom - contextTop <= available ? contextTop : bounds.top;
  const fits = bounds.bottom - top <= available;
  if (fits && top >= margin && bounds.bottom <= window.innerHeight - margin) return;
  if (!fits && top >= margin && top <= margin + Math.min(64, available * 0.15)) return;
  const destination = Math.max(0, window.scrollY + top - margin);
  if (Math.abs(destination - window.scrollY) < 1) return;
  window.scrollTo({ top: destination, behavior: 'instant' });
}

export function focusAndReveal(element: HTMLElement | null | undefined, context?: HTMLElement | null) {
  if (!element) return;
  element.focus({ preventScroll: true });
  revealRegion(element, context);
}
