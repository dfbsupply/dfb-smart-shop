import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { en } from './langs/en';
import { fil } from './langs/fil';

// ----------------------------------------------------------------------

export const STORAGE_KEY = 'dfb-language';

export const LANGS = [
  { value: 'en', label: 'English' },
  { value: 'fil', label: 'Filipino' },
] as const;

export type LangValue = (typeof LANGS)[number]['value'];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fil: { translation: fil },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fil'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: false },
  });

export default i18n;
