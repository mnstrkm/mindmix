import { describe, expect, it } from 'vitest';
import { comparisonKey, createStorage, isBetter, parseData, type Result } from './storage';
const result = (patch: Partial<Result> = {}): Result => ({ id: 'one', game: 'digits', variant: 'default', ruleVersion: 1, score: 2, actions: 1, date: '2026-10-18T12:00:00Z', ...patch });
describe('storage and records', () => {
  it('defaults both volume controls to 50 percent while preserving saved choices', () => {
    expect(parseData(null).settings).toMatchObject({ effectVolume: 0.5, musicVolume: 0.5 });
    expect(parseData(JSON.stringify({ version: 1, settings: { effectVolume: 0.25, musicVolume: 0.2 } })).settings).toMatchObject({ effectVolume: 0.25, musicVolume: 0.2 });
  });
  it('finalizes a session once and ignores an untouched round', () => {
    const store = createStorage();
    expect(store.finalize(result({ actions: 0 }))).toBe(false);
    expect(store.finalize(result())).toBe(true);
    expect(store.finalize(result())).toBe(false);
    expect(store.getSnapshot().data.history).toHaveLength(1);
  });
  it('keeps the last 30 rounds, but retains an older best result', () => {
    const store = createStorage();
    for (let i = 0; i < 40; i++) store.finalize(result({ id: String(i), score: 40 - i }));
    expect(store.getSnapshot().data.history).toHaveLength(30);
    expect(store.getSnapshot().data.records[0].score).toBe(40);
  });
  it('handles storage errors without losing the in-memory result', () => {
    const store = createStorage({ getItem: () => { throw Error('denied'); }, setItem: () => { throw Error('quota'); } });
    expect(store.finalize(result())).toBe(true);
    expect(store.getSnapshot().persistent).toBe(false);
    expect(store.getSnapshot().data.history).toHaveLength(1);
  });
  it('rejects broken data and validates individual results', () => {
    expect(() => parseData('{')).toThrow();
    expect(() => parseData('{"version":99}')).toThrow();
    expect(parseData(JSON.stringify({ version: 1, settings: { effectVolume: -1 }, history: [{ ...result(), score: '200' }] })).history).toEqual([]);
  });
  it('compares only matching rules/content/variants and ignores interface language elsewhere', () => {
    expect(comparisonKey(result({ language: 'de' }))).toBe(comparisonKey(result({ language: 'tr' })));
    expect(comparisonKey(result({ game: 'recognition', language: 'de' }))).not.toBe(comparisonKey(result({ game: 'recognition', language: 'tr' })));
    expect(comparisonKey(result({ variant: 'basic' }))).not.toBe(comparisonKey(result({ variant: 'mixed' })));
    expect(isBetter({ game: 'reaction', score: 200 }, { score: 300 })).toBe(true);
    expect(isBetter({ game: 'digits', score: 2 }, { score: 3 })).toBe(false);
  });
  it('does not rank incomplete reaction sessions, but retains their history', () => {
    const store = createStorage();
    store.finalize(result({ game: 'reaction', eligible: false, score: 180 }));
    expect(store.getSnapshot().data.records).toEqual([]);
    expect(store.getSnapshot().data.history).toHaveLength(1);
  });
  it('keeps average and fastest records independently even after the original history expires', () => {
    const store = createStorage();
    store.finalize(result({ id: 'quick-single', game: 'reaction', ruleVersion: 2, score: 400, recordScores: { fastest: 120 } }));
    for (let i = 0; i < 40; i++) store.finalize(result({ id: String(i), game: 'reaction', ruleVersion: 2, score: 250, recordScores: { fastest: 200 } }));
    expect(store.getSnapshot().data.records.find(item => !item.metric)?.score).toBe(250);
    expect(store.getSnapshot().data.records.find(item => item.metric === 'fastest')?.score).toBe(120);
    expect(store.getSnapshot().data.history).toHaveLength(30);
  });
  it('ranks a valid single trial separately without granting an incomplete session an average record', () => {
    const store = createStorage();
    store.finalize(result({ game: 'reaction', ruleVersion: 2, eligible: false, score: 0, recordScores: { fastest: 180 } }));
    expect(store.getSnapshot().data.records).toHaveLength(1);
    expect(store.getSnapshot().data.records[0]).toMatchObject({ metric: 'fastest', score: 180, eligible: true });
  });
  it('defaults legacy settings to dark, retains old rule records and reloads both metric records', () => {
    const old = result({ game: 'reaction', ruleVersion: 1, score: 220 });
    const parsed = parseData(JSON.stringify({ version: 1, settings: { language: 'tr' }, records: [old] }));
    expect(parsed.settings).toMatchObject({ theme: 'dark', language: 'tr' });
    expect(parsed.records[0]).toEqual(old);
    const withMetrics = parseData(JSON.stringify({ ...parsed, records: [old, result({ id: 'new', game: 'reaction', ruleVersion: 2, metric: 'fastest', score: 160 })] }));
    expect(withMetrics.records).toHaveLength(2);
  });
});
