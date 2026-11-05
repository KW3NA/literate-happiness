// Bridge between LanguageContext (app-wide language state) and i18next.
// Keeping this in a separate module avoids a circular import between
// LanguageContext.tsx and TranslatedText.tsx.
import i18n from '../i18n';

export const syncI18nLanguage = (language: string) => {
  try {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  } catch (e) {
    // never let language syncing break the UI
  }
};
