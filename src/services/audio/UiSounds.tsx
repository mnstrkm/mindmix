import { useEffect } from 'react';
import { audio } from './audio';

function control(event: Event): HTMLElement | null {
  const target = event.target;
  if (!(target instanceof Element)) return null;
  const element = target.closest<HTMLElement>('button, a[href], input, select, summary');
  if (!element || element.matches(':disabled, [aria-disabled="true"]')) return null;
  return element;
}

/** Controls with their own game feedback opt out; every other activation gets one quiet tick. */
export function UiSounds() {
  useEffect(() => {
    const unlock = (event: Event) => { if (control(event)) audio.unlock(); };
    const click = (event: Event) => {
      const element = control(event);
      if (element && !element.closest('[data-ui-sound="off"]') && !element.matches('input[type="range"], select')) audio.play('ui');
    };
    const change = (event: Event) => {
      const element = control(event);
      if (element?.matches('input[type="range"], select') && !element.closest('[data-ui-sound="off"]')) { audio.unlock(); audio.play('ui'); }
    };
    document.addEventListener('click', unlock, true);
    document.addEventListener('click', click);
    document.addEventListener('change', change);
    return () => {
      document.removeEventListener('click', unlock, true);
      document.removeEventListener('click', click);
      document.removeEventListener('change', change);
    };
  }, []);
  return null;
}
