import { INTRO_BLOCK_LENGTH, PROGRESSION } from './config';

export type Color = 'blue' | 'orange';
export type Shape = 'circle' | 'triangle';
export type Rule = 'color' | 'shape';
export type Side = 'left' | 'right';
export interface SwitchTask { color: Color; shape: Shape; rule: Rule; switched: boolean }

export function difficulty(solved: number) {
  let level = 1;
  let switchProbability = 0;
  PROGRESSION.forEach((step, index) => {
    if (solved >= step.from) { level = index + 2; switchProbability = step.switchProbability; }
  });
  return { level, switchProbability };
}

export function correctSide(task: Pick<SwitchTask, 'color' | 'shape' | 'rule'>): Side {
  return task.rule === 'color'
    ? task.color === 'blue' ? 'left' : 'right'
    : task.shape === 'circle' ? 'left' : 'right';
}

export function createTask(solved: number, random: () => number, previous?: SwitchTask): SwitchTask {
  let rule: Rule;
  if (solved < INTRO_BLOCK_LENGTH) rule = 'color';
  else if (solved < INTRO_BLOCK_LENGTH * 2) rule = 'shape';
  else {
    const previousRule = previous?.rule ?? 'shape';
    rule = random() < difficulty(solved).switchProbability
      ? previousRule === 'color' ? 'shape' : 'color'
      : previousRule;
  }
  // Separate draws keep the two properties independent, including conflicting combinations.
  const color: Color = random() < 0.5 ? 'blue' : 'orange';
  const shape: Shape = random() < 0.5 ? 'circle' : 'triangle';
  return { rule, color, shape, switched: !!previous && previous.rule !== rule };
}
