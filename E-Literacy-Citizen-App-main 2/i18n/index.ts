// i18n configuration for the E-Literacy Citizen app.
// Uses i18next + react-i18next with static translation resources (no API key needed).
// Device language is auto-detected via expo-localization and persisted with AsyncStorage.
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en';
import af from './locales/af';
import zu from './locales/zu';
import xh from './locales/xh';
import tn from './locales/tn';
import ve from './locales/ve';
import ts from './locales/ts';
import nso from './locales/nso';
import st from './locales/st';
import nr from './locales/nr';
import ss from './locales/ss';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'af', label: 'Afrikaans' },
  { code: 'zu', label: 'isiZulu' },
  { code: 'xh', label: 'isiXhosa' },
  { code: 'tn', label: 'Setswana' },
  { code: 've', label: 'Tshivenḓa' },
  { code: 'ts', label: 'Xitsonga' },
  { code: 'nso', label: 'Sepedi' },
  { code: 'st', label: 'Sesotho' },
  { code: 'nr', label: 'isiNdebele' },
  { code: 'ss', label: 'siSwati' },
] as const;

export type SupportedLanguageCode = (typeof SUPPORTED_LANGUAGES)[number]['code'];

const STORAGE_KEY = '@e_literacy_language';

const resources: Record<string, { translation: any }> = {
  en: { translation: en },
  af: { translation: af },
  zu: { translation: zu },
  xh: { translation: xh },
  tn: { translation: tn },
  ve: { translation: ve },
  ts: { translation: ts },
  nso: { translation: nso },
  st: { translation: st },
  nr: { translation: nr },
  ss: { translation: ss },
};

// Map device locales (e.g. 'en-ZA', 'af-ZA', 'zu-ZA') onto supported languages.
const detectDeviceLanguage = (): SupportedLanguageCode => {
  try {
    const locales = Localization.getLocales();
    for (const locale of locales) {
      const code = (locale as { languageCode?: string }).languageCode;
      if (code && SUPPORTED_LANGUAGES.some((l) => l.code === code)) {
        return code as SupportedLanguageCode;
      }
    }
  } catch (e) {
    // fall through to English
  }
  return 'en';
};

i18n.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: {
    // React Native already escapes values rendered in Text components.
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

// Restore the previously chosen language (if any) without blocking startup.
AsyncStorage.getItem(STORAGE_KEY)
  .then((saved) => {
    if (saved && resources[saved]) {
      i18n.changeLanguage(saved);
    }
  })
  .catch(() => {});

export const changeAppLanguage = async (code: SupportedLanguageCode) => {
  await i18n.changeLanguage(code);
  try {
    await AsyncStorage.setItem(STORAGE_KEY, code);
  } catch (e) {
    // persistence failure should not break the UI
  }
};

export default i18n;
