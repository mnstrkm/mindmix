export type Signal = 0 | 1 | 2 | 3;

export function randomSignal(random: () => number = Math.random): Signal {
  return Math.floor(random() * 4) as Signal;
}

export function createSequence(length: number, random: () => number = Math.random): Signal[] {
  return Array.from({ length }, () => randomSignal(random));
}

export function extendSequence(sequence: readonly Signal[], random: () => number = Math.random): Signal[] {
  return [...sequence, randomSignal(random)];
}

export function checkSignal(sequence: readonly Signal[], index: number, signal: Signal): 'wrong' | 'continue' | 'complete' {
  if (sequence[index] !== signal) return 'wrong';
  return index === sequence.length - 1 ? 'complete' : 'continue';
}
