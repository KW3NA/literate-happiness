// Static string catalog for the E-Literacy Citizen app.
// Maps English display strings to i18n keys defined in /i18n/locales/*.ts.
// TranslatedText uses this to render localized labels synchronously (no API key needed).
import en from '../i18n/locales/en';

type FlatCatalog = Record<string, string>;

const flatten = (obj: any, prefix = ''): FlatCatalog => {
  const out: FlatCatalog = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      out[value] = path; // English text -> translation key
    } else if (value && typeof value === 'object') {
      Object.assign(out, flatten(value, path));
    }
  }
  return out;
};

export const STRING_TO_KEY: FlatCatalog = flatten(en);

/** Returns the i18n key for a known English UI string, or null. */
export const keyForString = (text: string): string | null => {
  const trimmed = typeof text === 'string' ? text.trim() : '';
  if (!trimmed) return null;
  return STRING_TO_KEY[trimmed] ?? null;
};

export default STRING_TO_KEY;
