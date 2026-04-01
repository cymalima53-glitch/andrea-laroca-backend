import 'server-only';
import type { Locale } from '../i18n-config';
import type { Dictionary } from '../app/types';

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
    en: () => import('../dictionaries/en.json').then((module) => module.default as unknown as Dictionary),
    it: () => import('../dictionaries/it.json').then((module) => module.default as unknown as Dictionary),
};

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
    return dictionaries[locale]?.() ?? dictionaries.en();
};
