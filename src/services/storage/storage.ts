import { gameIds, type GameId, type GameResult, type Language } from '../../app/types';

export const STORAGE_KEY = 'mindmix:data';
export const SCHEMA_VERSION = 1;
export interface Settings {
  language: Language; theme: 'dark' | 'light'; effects: boolean; effectVolume: number; music: boolean; musicVolume: number; textSize: 'normal' | 'large' | 'extra';
}
export interface Result extends Omit<GameResult, 'review'> {
  id: string; game: GameId; variant: string; ruleVersion: number;
  language?: Language; contentVersion?: number; date: string;
  metric?: string;
}
export interface SavedData { version: 1; settings: Settings; history: Result[]; records: Result[] }
export interface Snapshot { data: SavedData; persistent: boolean }
export const defaultSettings: Settings = { language: 'de', theme: 'dark', effects: true, effectVolume: 0.5, music: false, musicVolume: 0.5, textSize: 'normal' };
const emptyData = (): SavedData => ({ version: 1, settings: { ...defaultSettings }, history: [], records: [] });
const object = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
export function validResult(value: unknown): value is Result {
  if (!object(value)) return false;
  return typeof value.id === 'string' && value.id.length <= 100 && gameIds.includes(value.game as GameId)
    && typeof value.variant === 'string' && value.variant.length <= 60 && finite(value.ruleVersion) && Number.isInteger(value.ruleVersion)
    && finite(value.score) && finite(value.actions) && Number.isInteger(value.actions)
    && typeof value.date === 'string' && Number.isFinite(Date.parse(value.date))
    && (value.language === undefined || value.language === 'de' || value.language === 'tr')
    && (value.contentVersion === undefined || finite(value.contentVersion))
    && (value.eligible === undefined || typeof value.eligible === 'boolean')
    && (value.metric === undefined || (typeof value.metric === 'string' && /^[a-z][a-zA-Z0-9]{0,39}$/.test(value.metric)))
    && (value.recordScores === undefined || (object(value.recordScores) && Object.keys(value.recordScores).length <= 5
      && Object.entries(value.recordScores).every(([key, score]) => /^[a-z][a-zA-Z0-9]{0,39}$/.test(key) && finite(score))))
    && (value.reason === undefined || ['mistake', 'completed', 'stopped', 'false-starts'].includes(String(value.reason)))
    && (value.stats === undefined || (object(value.stats) && Object.keys(value.stats).length <= 20
      && Object.entries(value.stats).every(([key, stat]) => key.length <= 80 && ((typeof stat === 'number' && Number.isFinite(stat)) || (typeof stat === 'string' && stat.length <= 400)))));
}
export function comparisonKey(result: Pick<Result, 'game' | 'variant' | 'ruleVersion' | 'language' | 'contentVersion' | 'metric'>): string {
  return [result.game, result.variant, result.ruleVersion, result.game === 'recognition' ? result.language : '', result.contentVersion ?? '', result.metric ?? 'score'].join(':');
}
export function isBetter(next: Pick<Result, 'game' | 'score'>, previous?: Pick<Result, 'score'>): boolean {
  return !previous || (next.game === 'reaction' ? next.score < previous.score : next.score > previous.score);
}
export function parseData(raw: string | null): SavedData {
  if (!raw) return emptyData();
  const parsed: unknown = JSON.parse(raw);
  if (!object(parsed) || parsed.version !== SCHEMA_VERSION) throw new Error('Unsupported storage schema');
  const settings = { ...defaultSettings };
  if (object(parsed.settings)) {
    const source = parsed.settings;
    if (source.language === 'de' || source.language === 'tr') settings.language = source.language;
    if (source.theme === 'dark' || source.theme === 'light') settings.theme = source.theme;
    if (typeof source.effects === 'boolean') settings.effects = source.effects;
    if (typeof source.music === 'boolean') settings.music = source.music;
    if (finite(source.effectVolume) && source.effectVolume <= 1) settings.effectVolume = source.effectVolume;
    if (finite(source.musicVolume) && source.musicVolume <= 1) settings.musicVolume = source.musicVolume;
    if (['normal', 'large', 'extra'].includes(String(source.textSize))) settings.textSize = source.textSize as Settings['textSize'];
  }
  const clean = (input: unknown): Result[] => Array.isArray(input) ? input.filter(validResult) : [];
  const history = gameIds.flatMap(game => clean(parsed.history).filter(result => result.game === game && result.actions > 0).slice(-30));
  const records: Result[] = [];
  for (const result of clean(parsed.records)) {
    if (result.eligible === false || result.score <= 0) continue;
    const index = records.findIndex(item => comparisonKey(item) === comparisonKey(result));
    if (index < 0) records.push(result);
    else if (isBetter(result, records[index])) records[index] = result;
  }
  return { version: 1, settings, history, records };
}
export interface StorageLike { getItem(key: string): string | null; setItem(key: string, value: string): void }
export function createStorage(storage?: StorageLike) {
  let snapshot: Snapshot = { data: emptyData(), persistent: Boolean(storage) };
  // Invalid/unknown data is kept on disk until an explicit new change, never trusted as executable state.
  try { snapshot.data = parseData(storage?.getItem(STORAGE_KEY) ?? null); } catch { snapshot.persistent = false; }
  const listeners = new Set<() => void>();
  const finalized = new Set(snapshot.data.history.map(item => item.id));
  const publish = (data: SavedData) => {
    let persistent = Boolean(storage);
    try { storage?.setItem(STORAGE_KEY, JSON.stringify(data)); } catch { persistent = false; }
    snapshot = { data, persistent };
    listeners.forEach(listener => listener());
  };
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    setSettings: (patch: Partial<Settings>) => publish({ ...snapshot.data, settings: { ...snapshot.data.settings, ...patch } }),
    finalize: (result: Result): boolean => {
      if (finalized.has(result.id) || result.actions <= 0 || !validResult(result)) return false;
      finalized.add(result.id);
      const history = [...snapshot.data.history, result];
      const trimmed = gameIds.flatMap(game => history.filter(item => item.game === game).slice(-30));
      const records = [...snapshot.data.records];
      const candidates = [result, ...Object.entries(result.recordScores ?? {}).map(([metric, score]) => ({ ...result, metric, score, eligible: true }))];
      for (const candidate of candidates) {
        const index = records.findIndex(item => comparisonKey(item) === comparisonKey(candidate));
        if (candidate.eligible !== false && candidate.score > 0 && isBetter(candidate, index < 0 ? undefined : records[index])) {
          if (index < 0) records.push(candidate); else records[index] = candidate;
        }
      }
      publish({ ...snapshot.data, history: trimmed, records });
      return true;
    },
  };
}
let browserStorage: StorageLike | undefined;
try { browserStorage = window.localStorage; } catch { /* Privacy mode: keep a usable in-memory store. */ }
export const storage = createStorage(browserStorage);
