/** Keep digits as text: leading zeroes and repeated digits are part of the task. */
export function createSequence(length: number, random: () => number = Math.random): string {
  return Array.from({ length }, () => Math.floor(random() * 10).toString()).join('');
}

export function matchesSequence(sequence: string, answer: string): boolean {
  return sequence === answer;
}

export function completedScore(previousScore: number, sequence: string, answer: string): number {
  return matchesSequence(sequence, answer) ? Math.max(previousScore, sequence.length) : previousScore;
}
