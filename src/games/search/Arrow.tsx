import { directions, type Direction } from './logic';

export default function Arrow({ direction }: { direction: Direction }) {
  return <svg viewBox="0 0 48 48" aria-hidden="true" focusable="false">
    <path d="M24 4 43 23H31V44H17V23H5Z" fill="currentColor" transform={`rotate(${directions.indexOf(direction) * 45} 24 24)`} />
  </svg>;
}
