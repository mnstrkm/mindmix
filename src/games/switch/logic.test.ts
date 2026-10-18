import { describe, expect, it } from 'vitest';
import { correctSide, createTask, difficulty, type Color, type Rule, type Shape, type SwitchTask } from './logic';

describe('rule switch', () => {
  it.each<[Color, Shape, Rule, string]>([
    ['blue', 'circle', 'color', 'left'], ['blue', 'triangle', 'color', 'left'],
    ['orange', 'circle', 'color', 'right'], ['orange', 'triangle', 'color', 'right'],
    ['blue', 'circle', 'shape', 'left'], ['blue', 'triangle', 'shape', 'right'],
    ['orange', 'circle', 'shape', 'left'], ['orange', 'triangle', 'shape', 'right'],
  ])('maps %s / %s under %s to %s', (color, shape, rule, side) => {
    expect(correctSide({ color, shape, rule })).toBe(side);
  });
  it('begins with four color tasks followed by four shape tasks', () => {
    let previous: SwitchTask | undefined;
    for (let solved = 0; solved < 8; solved += 1) {
      previous = createTask(solved, () => 0.3, previous);
      expect(previous.rule).toBe(solved < 4 ? 'color' : 'shape');
      expect(previous.switched).toBe(solved === 4);
    }
  });
  it('draws independent properties, allowing every combination', () => {
    for (const color of [0.1, 0.8]) for (const shape of [0.1, 0.8]) {
      const draws = [color, shape];
      const task = createTask(0, () => draws.shift()!);
      expect(task.color).toBe(color < 0.5 ? 'blue' : 'orange');
      expect(task.shape).toBe(shape < 0.5 ? 'circle' : 'triangle');
    }
  });
  it('switches by the configured probability without an enforced alternation', () => {
    const previous: SwitchTask = { rule: 'color', color: 'orange', shape: 'circle', switched: false };
    expect(createTask(8, () => 0.24, previous)).toMatchObject({ rule: 'shape', switched: true });
    expect(createTask(8, () => 0.25, previous)).toMatchObject({ rule: 'color', switched: false });
    expect(difficulty(16)).toEqual({ level: 3, switchProbability: 0.4 });
    expect(difficulty(24)).toEqual({ level: 4, switchProbability: 0.5 });
    expect(difficulty(10000)).toEqual(difficulty(24));
  });
});
