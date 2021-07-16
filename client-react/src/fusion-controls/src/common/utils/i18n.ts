import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translation_en from '../translations/en-EN/translation.json';

i18n.use(initReactI18next).init({
  fallbackLng: 'en',
  debug: false,
  ns: ['translation'],
  defaultNS: 'translation',
  resources: {
    en: {
      translation: translation_en,
    },
  },

  interpolation: {
    escapeValue: false, // not needed for react!!
    formatSeparator: ',',
  },

  react: {
    wait: true,
  },
});

export default i18n;
