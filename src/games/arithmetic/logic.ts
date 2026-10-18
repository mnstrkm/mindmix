import { PROGRESSION } from './config';

export type Mode = 'basic' | 'mixed';
export type Operation = '+' | '−' | '×' | '÷';
export interface Question { left: number; right: number; operation: Operation; answer: number }
export interface Task { question: Question; bag: Operation[] }

export function difficulty(mode: Mode, solved: number) {
  const levels = PROGRESSION[mode];
  let index = 0;
  levels.forEach((level, i) => { if (solved >= level.from) index = i; });
  return { ...levels[index]!, level: index + 1 };
}

function integer(minimum: number, maximum: number, random: () => number): number {
  return minimum + Math.floor(Math.min(0.999999999, Math.max(0, random())) * (maximum - minimum + 1));
}

export function evaluate(left: number, right: number, operation: Operation): number {
  switch (operation) {
    case '+': return left + right;
    case '−': return left - right;
    case '×': return left * right;
    case '÷': return left / right;
  }
}

export function equation(question: Question): string {
  return `${question.left} ${question.operation} ${question.right} = ${question.answer}`;
}

function equal(a: Question, b?: Question): boolean {
  return !!b && a.left === b.left && a.right === b.right && a.operation === b.operation;
}

/** A shuffled operation bag gives balance without a predictable alternation. */
export function nextTask(mode: Mode, solved: number, random: () => number, previous?: Task): Task {
  const { maximum, factor } = difficulty(mode, solved);
  const bag: Operation[] = previous?.bag.length ? [...previous.bag] : mode === 'basic' ? ['+', '−'] : ['+', '−', '×', '÷'];
  const index = integer(0, bag.length - 1, random);
  const operation = bag.splice(index, 1)[0]!;
  function create(left: number, right: number): Question {
    return { left, right, operation, answer: evaluate(left, right, operation) };
  }
  // Neither zero nor one is used as an operand. Every operation needs a real calculation.
  for (let attempt = 0; attempt < 16; attempt += 1) {
    let candidate: Question;
    if (operation === '+') {
      const left = integer(2, maximum - 2, random);
      candidate = create(left, integer(2, maximum - left, random));
    } else if (operation === '−') {
      const left = integer(4, maximum, random);
      candidate = create(left, integer(2, left - 2, random));
    } else if (operation === '×') {
      candidate = create(integer(2, factor, random), integer(2, factor, random));
    } else {
      const divisor = integer(2, factor, random);
      candidate = create(divisor * integer(2, factor, random), divisor);
    }
    if (!equal(candidate, previous?.question)) return { question: candidate, bag };
  }
  // Bounded fallback remains correct even with a constant injected random source.
  const fallback = operation === '+' ? [create(2, 3), create(3, 4)]
    : operation === '−' ? [create(7, 3), create(9, 4)]
      : operation === '×' ? [create(2, 3), create(3, 4)]
        : [create(6, 2), create(12, 3)];
  return { question: fallback.find((candidate) => !equal(candidate, previous?.question))!, bag };
}

export function isAnswerCorrect(value: string, question: Question): boolean {
  return /^\d+$/.test(value) && Number(value) === question.answer;
}
