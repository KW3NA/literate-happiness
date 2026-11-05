import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { TranslationService } from './translation';
import { getApiKey, validateApiKey } from '../config/translation';
import { syncI18nLanguage } from './languageBridge';

export type SupportedLanguage = 'en' | 'af' | 'zu' | 'xh' | 'tn' | 've' | 'ts' | 'nso' | 'st' | 'nr' | 'ss';

// Languages that have full static i18n bundles (see /i18n/locales).
export const I18N_LANGUAGES: SupportedLanguage[] = ['en', 'af', 'zu', 'xh', 'tn', 've', 'ts', 'nso', 'st', 'nr', 'ss'];

const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  af: 'Afrikaans',
  zu: 'Zulu',
  xh: 'Xhosa',
  tn: 'Tswana',
  ve: 'Tshivenda',
  ts: 'Xitsonga',
  nso: 'Sepedi',
  st: 'Sesotho',
  nr: 'Ndebele',
  ss: 'Swati',
};

const LANGUAGE_STORAGE_KEY = '@e_literacy_language';

// Detect the device language and map it onto a supported language.
// English is always the default when nothing has been chosen yet.
const detectDeviceLanguage = (): SupportedLanguage => {
  try {
    const locales = Localization.getLocales();
    for (const locale of locales) {
      const code = (locale as { languageCode?: string }).languageCode;
      if (code && code in languageNames) {
        return code as SupportedLanguage;
      }
    }
  } catch (e) {
    // fall through to English
  }
  return 'en';
};

interface LanguageContextProps {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  /**
   * Resolve a translation key against the active i18n bundle.
   * Falls back to English when the selected language has no static bundle yet.
   */
  t: (key: string, options?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>('en');

  // On very first launch (no saved choice), adopt the device language if it is
  // one of the supported languages; otherwise stay on English (the default).
  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (!saved || !(saved in languageNames)) {
          const detected = detectDeviceLanguage();
          setLanguageState(detected);
          AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, detected).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  // Initialize translation service with API key (used for dynamic content translation).
  useEffect(() => {
    const apiKey = getApiKey();
    if (validateApiKey(apiKey)) {
      TranslationService.initialize(apiKey);
      console.log('Translation service initialized successfully');
    } else {
      console.warn('Invalid or missing Google Cloud Translation API key. Dynamic (live) translation is disabled; static i18n translations still work.');
    }
  }, []);

  // Restore persisted language choice on startup.
  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((saved) => {
        if (saved && saved in languageNames) {
          setLanguageState(saved as SupportedLanguage);
        }
      })
      .catch(() => {});
  }, []);

  // Keep i18next in sync with the app-level language selection so that
  // useTranslation() components re-render with the right bundle.
  useEffect(() => {
    const i18nLang = I18N_LANGUAGES.includes(language) ? language : 'en';
    syncI18nLanguage(i18nLang);
  }, [language]);

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang).catch(() => {});
  }, []);

  const t = useCallback(
    (key: string, options?: Record<string, any>) => {
      // Lazy import avoided: i18n instance is a module singleton.
      const i18nModule = require('../i18n').default;
      return i18nModule.t(key, options) as string;
    },
    []
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

export const getLanguageName = (lang: SupportedLanguage) => languageNames[lang];
