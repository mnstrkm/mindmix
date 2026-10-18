import { germanWords } from './words-de';
import { turkishWords } from './words-tr';

export const words: Readonly<Record<'de' | 'tr', readonly string[]>> = { de: germanWords, tr: turkishWords };
export function normalizeWord(word: string, language: 'de' | 'tr'): string {
  return word.normalize('NFC').toLocaleLowerCase(language);
}
