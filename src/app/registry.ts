import { lazy } from 'react';
import type { GameId } from './types';
import { RULE_VERSION as recognitionVersion, CONTENT_VERSION } from '../games/recognition/config';
import { RULE_VERSION as digitsVersion } from '../games/digits/config';
import { RULE_VERSION as simonVersion } from '../games/simon/config';
import { RULE_VERSION as spatialVersion } from '../games/spatial/config';
import { RULE_VERSION as arithmeticVersion } from '../games/arithmetic/config';
import { RULE_VERSION as searchVersion } from '../games/search/config';
import { RULE_VERSION as switchVersion } from '../games/switch/config';
import { RULE_VERSION as reactionVersion } from '../games/reaction/config';
export const games = [
  { id: 'recognition', component: lazy(() => import('../games/recognition/Game')), ruleVersion: recognitionVersion, contentVersion: CONTENT_VERSION, tone: 'sage' },
  { id: 'digits', component: lazy(() => import('../games/digits/Game')), ruleVersion: digitsVersion, tone: 'lavender' },
  { id: 'simon', component: lazy(() => import('../games/simon/Game')), ruleVersion: simonVersion, tone: 'peach' },
  { id: 'spatial', component: lazy(() => import('../games/spatial/Game')), ruleVersion: spatialVersion, tone: 'blue' },
  { id: 'arithmetic', component: lazy(() => import('../games/arithmetic/Game')), ruleVersion: arithmeticVersion, tone: 'yellow' },
  { id: 'search', component: lazy(() => import('../games/search/Game')), ruleVersion: searchVersion, tone: 'rose' },
  { id: 'switch', component: lazy(() => import('../games/switch/Game')), ruleVersion: switchVersion, tone: 'mint' },
  { id: 'reaction', component: lazy(() => import('../games/reaction/Game')), ruleVersion: reactionVersion, tone: 'sand' },
] satisfies { id: GameId; component: ReturnType<typeof lazy>; ruleVersion: number; contentVersion?: number; tone: string }[];
export const getGame = (id: string | undefined) => games.find(game => game.id === id);
