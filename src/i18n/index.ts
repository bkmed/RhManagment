import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { storageService } from '../services/storage';
import { Platform } from 'react-native';

// Import translation files
import en from './locales/en.json';
import fr from './locales/fr.json';
import ar from './locales/ar.json';
import de from './locales/de.json';

// Language detector for web and mobile
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLanguage = storageService.getString('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      // Default to English if no saved language
      callback('en');
    } catch (error) {
      console.error('Error detecting language:', error);
      callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      storageService.setString('user-language', language);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      fr: { translation: fr },
      ar: { translation: ar },
      de: { translation: de },
    },
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

export default i18n;
