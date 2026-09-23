import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '@/types/locale';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
export const SITE_NAME = 'Premium Turkish Marble';
export const SITE_NAME_TR = 'Premium Türk Mermeri';

export const ALL_LOCALE_PATHS = SUPPORTED_LOCALES.map((l) => l);

export function buildAlternates(path: string): Record<string, string> {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
  );
}

export function buildXDefault(path: string): string {
  return `${SITE_URL}/${DEFAULT_LOCALE}${path}`;
}

export function buildFullAlternates(path: string): { languages: Record<string, string>; xDefault: string } {
  return {
    languages: buildAlternates(path),
    xDefault: buildXDefault(path),
  };
}

export function getOGLocale(locale: Locale): string {
  const map: Record<Locale, string> = {
    tr: 'tr_TR',
    en: 'en_US',
    es: 'es_ES',
    fr: 'fr_FR',
    de: 'de_DE',
    it: 'it_IT',
    ar: 'ar_SA',
  };
  return map[locale];
}
