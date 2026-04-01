import 'server-only';
import type { Locale } from '../../i18n-config';
import type { Dictionary } from '../types';

// We enumerate all dictionaries here for better linting and typescript support
// We also get the default import for cleaner types
const dictionaries = {
  en: () => import('../../dictionaries/en.json').then((module) => module.default as unknown as Dictionary),
  it: () => import('../../dictionaries/it.json').then((module) => module.default as unknown as Dictionary),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> =>
  dictionaries[locale]?.() ?? dictionaries.en();
