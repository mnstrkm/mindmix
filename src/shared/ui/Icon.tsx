import type { GameId } from '../../app/types';
export function GameIcon({ id, className = '' }: { id: GameId; className?: string }) {
  const shapes = {
    recognition: <><rect x="8" y="11" width="34" height="31" rx="7" transform="rotate(-9 25 26)" /><rect x="22" y="21" width="34" height="31" rx="7" fill="currentColor" /><path d="m30 37 6 6 12-14" stroke="var(--icon-bg, #e6eee3)" /></>,
    digits: <><rect x="8" y="12" width="48" height="40" rx="10" /><path d="m17 24 5-3v22m12-18c0-8 13-6 13 0 0 5-13 9-13 17h14" /></>,
    simon: <><rect x="8" y="8" width="21" height="21" rx="6" fill="currentColor" /><rect x="35" y="8" width="21" height="21" rx="6" /><rect x="8" y="35" width="21" height="21" rx="6" /><rect x="35" y="35" width="21" height="21" rx="6" fill="currentColor" opacity=".4" /></>,
    spatial: <>{[0, 1, 2].flatMap(row => [0, 1, 2].map(col => <rect key={`${row}${col}`} x={9 + col * 17} y={9 + row * 17} width="12" height="12" rx="3" fill={(row + col) % 2 ? 'none' : 'currentColor'} />))}</>,
    arithmetic: <><path d="M10 18h18m-9-9v18m17-9h18M10 41l15 15m0-15L10 56m27-10h18m-18 8h18" /></>,
    search: <><circle cx="27" cy="27" r="17" /><path d="m40 40 15 15m-35-28h14m-6-6 6 6-6 6" /></>,
    switch: <><circle cx="17" cy="20" r="10" fill="currentColor" /><path d="m44 32 13 22H31ZM32 13h20m-6-6 6 6-6 6M28 51H8m6-6-6 6 6 6" /></>,
    reaction: <path d="M36 5 13 36h17l-3 23 24-33H34Z" fill="currentColor" />,
  };
  return <svg className={className} viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shapes[id]}</svg>;
}
export function ArrowIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" /></svg>; }
export function BrandMark() { return <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="1" y="1" width="38" height="38" rx="11" fill="#182c2d" stroke="#49766b" /><path d="M10 28V12l10 11 10-11v16" fill="none" stroke="#91dec3" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" /></svg>; }
