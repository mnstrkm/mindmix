import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { GameId, GameProps } from './types';
import { RULE_VERSION as recognitionVersion, CONTENT_VERSION } from '../games/recognition/config';
import { RULE_VERSION as digitsVersion } from '../games/digits/config';
import { RULE_VERSION as simonVersion } from '../games/simon/config';
import { RULE_VERSION as spatialVersion } from '../games/spatial/config';
import { RULE_VERSION as arithmeticVersion, MIXED_RULE_VERSION } from '../games/arithmetic/config';
import { RULE_VERSION as searchVersion } from '../games/search/config';
import { RULE_VERSION as switchVersion } from '../games/switch/config';
import { RULE_VERSION as reactionVersion } from '../games/reaction/config';
import RecognitionGuide from '../games/recognition/Guide';
import DigitsGuide from '../games/digits/Guide';
import SimonGuide from '../games/simon/Guide';
import SpatialGuide from '../games/spatial/Guide';
import ArithmeticGuide from '../games/arithmetic/Guide';
import SearchGuide from '../games/search/Guide';
import SwitchGuide from '../games/switch/Guide';
import ReactionGuide from '../games/reaction/Guide';
export interface GameDefinition {
  id: GameId; component: LazyExoticComponent<ComponentType<GameProps>>;
  ruleVersion: number; contentVersion?: number; tone: string;
  variantRuleVersions?: Record<string, number>; recordMetrics?: string[];
  guide?: ComponentType;
}
export const games: GameDefinition[] = [
  { id: 'recognition', component: lazy(() => import('../games/recognition/Game')), ruleVersion: recognitionVersion, contentVersion: CONTENT_VERSION, tone: 'sage' },
  { id: 'digits', component: lazy(() => import('../games/digits/Game')), ruleVersion: digitsVersion, tone: 'lavender' },
  { id: 'simon', component: lazy(() => import('../games/simon/Game')), ruleVersion: simonVersion, tone: 'peach' },
  { id: 'spatial', component: lazy(() => import('../games/spatial/Game')), ruleVersion: spatialVersion, tone: 'blue' },
  { id: 'arithmetic', component: lazy(() => import('../games/arithmetic/Game')), ruleVersion: arithmeticVersion, variantRuleVersions: { mixed: MIXED_RULE_VERSION }, tone: 'yellow' },
  { id: 'search', component: lazy(() => import('../games/search/Game')), ruleVersion: searchVersion, tone: 'rose' },
  { id: 'switch', component: lazy(() => import('../games/switch/Game')), ruleVersion: switchVersion, tone: 'mint' },
  { id: 'reaction', component: lazy(() => import('../games/reaction/Game')), ruleVersion: reactionVersion, recordMetrics: ['fastest'], tone: 'sand' },
];
export const getRuleVersion = (game: GameDefinition, variant: string) => game.variantRuleVersions?.[variant] ?? game.ruleVersion;
export const getGame = (id: string | undefined) => games.find(game => game.id === id);
const guides: Record<GameId, ComponentType> = { recognition: RecognitionGuide, digits: DigitsGuide, simon: SimonGuide, spatial: SpatialGuide, arithmetic: ArithmeticGuide, search: SearchGuide, switch: SwitchGuide, reaction: ReactionGuide };
for (const game of games) game.guide = guides[game.id];
