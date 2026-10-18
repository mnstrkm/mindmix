import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { common } from './common';
import { translations as recognition } from '../games/recognition/translations';
import { translations as digits } from '../games/digits/translations';
import { translations as simon } from '../games/simon/translations';
import { translations as spatial } from '../games/spatial/translations';
import { translations as arithmetic } from '../games/arithmetic/translations';
import { translations as search } from '../games/search/translations';
import { translations as switchGame } from '../games/switch/translations';
import { translations as reaction } from '../games/reaction/translations';
import { storage } from '../services/storage/storage';

export const resources = {
  de: { common: common.de, recognition: recognition.de, digits: digits.de, simon: simon.de, spatial: spatial.de, arithmetic: arithmetic.de, search: search.de, switch: switchGame.de, reaction: reaction.de },
  tr: { common: common.tr, recognition: recognition.tr, digits: digits.tr, simon: simon.tr, spatial: spatial.tr, arithmetic: arithmetic.tr, search: search.tr, switch: switchGame.tr, reaction: reaction.tr },
};
void i18n.use(initReactI18next).init({ resources, lng: storage.getSnapshot().data.settings.language, fallbackLng: 'de', defaultNS: 'common', interpolation: { escapeValue: false }, returnNull: false });
export default i18n;
