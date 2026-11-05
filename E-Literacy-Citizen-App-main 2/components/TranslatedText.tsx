import React from 'react';
import { Text, TextProps } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from './ThemeContext';
import { useLanguage, I18N_LANGUAGES } from './LanguageContext';
import { TranslationService } from './translation';
import { keyForString } from '../i18n/stringCatalog';

type TranslatedTextProps = Omit<TextProps, 'children'> & {
  children?: React.ReactNode;
  fallbackToOriginal?: boolean;
};

/**
 * Flatten JSX children (e.g. `<>{a}{' '}{b}</>`, nested <Text>, arrays) into a
 * plain string so the translation pipeline always receives a renderable string.
 * This prevents React Native's "Text strings must be rendered within a <Text>
 * component" error caused by passing raw nodes down to the inner <Text>.
 */
function flattenChildren(children: React.ReactNode): string {
  if (children == null || typeof children === 'boolean') return '';
  if (typeof children === 'string') return children;
  if (typeof children === 'number') return String(children);
  if (Array.isArray(children)) return children.map(flattenChildren).join('');
  // Nested element (e.g. <Text>…</Text>) or fragment – extract its children.
  const node = children as { props?: { children?: React.ReactNode } };
  if (node && typeof node === 'object' && node.props && 'children' in node.props) {
    return flattenChildren(node.props.children);
  }
  return '';
}

/**
 * Renders text through the i18n pipeline:
 *  1. Known UI strings are translated synchronously from static bundles (en/af/zu).
 *  2. Unknown strings (e.g. dynamic content) fall back to the Google Translate
 *     service when an API key is configured.
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  children,
  fallbackToOriginal = true,
  ...rest
}) => {
  const { language } = useLanguage();
  const { t: translateKey } = useTranslation();
  const { colors } = useTheme();

  const rawValue = flattenChildren(children);
  // Never let a non-string (object/array) reach the inner <Text> directly.
  const value = typeof children === 'string' || typeof children === 'number'
    ? String(children)
    : rawValue;
  const key = value ? keyForString(String(value)) : null;

  // Synchronous static translation for known keys in bundled languages.
  const staticText =
    key && I18N_LANGUAGES.includes(language) ? translateKey(key) : null;

  // Async fallback for unknown strings via the live translation service.
  const [dynamicText, setDynamicText] = React.useState<string | null>(null);
  React.useEffect(() => {
    let isMounted = true;
    if (!value || staticText !== null || language === 'en') {
      setDynamicText(null);
      return;
    }
    if (!TranslationService.isInitialized?.()) {
      setDynamicText(null);
      return;
    }
    TranslationService.translateText(String(value), language as any, 'en')
      .then((res) => { if (isMounted) setDynamicText(res); })
      .catch(() => { if (isMounted) setDynamicText(null); });
    return () => { isMounted = false; };
  }, [value, language, staticText]);

  const displayed = staticText ?? (language === 'en' ? value : dynamicText ?? (fallbackToOriginal ? value : null));

  // Guarantee the inner <Text> only ever receives a plain string, never raw
  // JSX nodes/objects (which trigger "Text strings must be rendered within
  // a <Text> component").
  const safeDisplayed: string | null =
    displayed == null ? null : typeof displayed === 'string' || typeof displayed === 'number'
      ? String(displayed)
      : rawValue;

  return (
    <Text {...rest} style={[{ color: colors.text }, rest.style]}>{safeDisplayed}</Text>
  );
};

export default TranslatedText;
