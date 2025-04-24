import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { getLocales } from "react-native-localize"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Import translations
import en from "./locales/en.json"
import fr from "./locales/fr.json"
import ar from "./locales/ar.json"

const LANGUAGES = {
  en,
  fr,
  ar,
}

const LANGUAGE_DETECTOR = {
  type: "languageDetector",
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // Get stored language from AsyncStorage
      const storedLanguage = await AsyncStorage.getItem("user-language")

      if (storedLanguage) {
        return callback(storedLanguage)
      }

      // If no stored language, use device language
      const deviceLanguage = getLocales()[0].languageCode

      // Check if device language is supported, otherwise use English
      const supportedLanguage = Object.keys(LANGUAGES).includes(deviceLanguage) ? deviceLanguage : "en"

      callback(supportedLanguage)
    } catch (error) {
      console.log("Error detecting language:", error)
      callback("en")
    }
  },
  init: () => {},
  cacheUserLanguage: async (lng: string) => {
    try {
      await AsyncStorage.setItem("user-language", lng)
    } catch (error) {
      console.log("Error caching language:", error)
    }
  },
}

i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    resources: LANGUAGES,
    fallbackLng: "en",
    compatibilityJSON: "v3",
    react: {
      useSuspense: false,
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
