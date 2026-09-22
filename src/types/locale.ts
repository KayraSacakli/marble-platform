// ============================================================
// Supported locales
// ============================================================

export const SUPPORTED_LOCALES = ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'tr';

// ============================================================
// RTL locales
// ============================================================

export const RTL_LOCALES: readonly Locale[] = ['ar'];
export type Direction = 'ltr' | 'rtl';

// ============================================================
// Locale metadata
// ============================================================

export interface LocaleMetadata {
  code: Locale;
  name: string;
  nativeName: string;
  direction: Direction;
}

export const LOCALE_METADATA: Record<Locale, LocaleMetadata> = {
  tr: { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', direction: 'ltr' },
  en: { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr' },
  es: { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr' },
  de: { code: 'de', name: 'German', nativeName: 'Deutsch', direction: 'ltr' },
  it: { code: 'it', name: 'Italian', nativeName: 'Italiano', direction: 'ltr' },
  ar: { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl' },
};

// ============================================================
// Locale helpers
// ============================================================

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function assertLocale(value: string): Locale {
  if (!isLocale(value)) {
    throw new Error(`Invalid locale: "${value}". Supported locales: ${SUPPORTED_LOCALES.join(', ')}`);
  }
  return value;
}

/**
 * Returns all alternate locales for a given locale (all except itself).
 */
export function getAlternateLocales(locale: Locale): Locale[] {
  return (SUPPORTED_LOCALES as readonly Locale[]).filter((l) => l !== locale);
}

/**
 * @deprecated Use getAlternateLocales instead. Kept for backward compatibility.
 */
export function getAlternateLocale(locale: Locale): Locale {
  return locale === 'tr' ? 'en' : 'tr';
}

/**
 * Returns the text direction for a locale.
 */
export function getLocaleDirection(locale: Locale): Direction {
  return (RTL_LOCALES as readonly Locale[]).includes(locale) ? 'rtl' : 'ltr';
}

/**
 * Returns metadata for a locale.
 */
export function getLocaleMetadata(locale: Locale): LocaleMetadata {
  return LOCALE_METADATA[locale];
}

/**
 * Returns the native name for a locale (used in language switcher UI).
 */
export function getLocaleNativeName(locale: Locale): string {
  return LOCALE_METADATA[locale].nativeName;
}

/**
 * Returns the OpenGraph locale string for a locale.
 */
export function getOpenGraphLocale(locale: Locale): string {
  const ogMap: Record<Locale, string> = {
    tr: 'tr_TR',
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    it: 'it_IT',
    ar: 'ar_SA',
  };
  return ogMap[locale];
}
