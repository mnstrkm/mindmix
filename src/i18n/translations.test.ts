import { describe, expect, it } from 'vitest';
import { resources } from './index';
function flatten(value: unknown, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value };
  return Object.assign({}, ...Object.entries(value as Record<string, unknown>).map(([key, item]) => flatten(item, `${prefix}.${key}`)));
}
describe('complete German and Turkish translations', () => {
  it('has identical keys and interpolation placeholders', () => {
    const de = flatten(resources.de); const tr = flatten(resources.tr);
    expect(Object.keys(de).sort()).toEqual(Object.keys(tr).sort());
    for (const key of Object.keys(de)) {
      expect(tr[key].trim(), key).not.toBe('');
      expect((tr[key].match(/{{\s*\w+\s*}}/g) ?? []).sort(), key).toEqual((de[key].match(/{{\s*\w+\s*}}/g) ?? []).sort());
    }
  });
});
