import type { Metadata } from 'next';
import { DEFAULT_LOCALE, type Locale } from '@/types/locale';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
export const SITE_NAME = 'Premium Turkish Marble';
export const SITE_NAME_TR = 'Premium Türk Mermeri';

/**
 * Single authoritative source of the locales advertised in public SEO output:
 * sitemap URLs, hreflang / alternate language links, locale canonical URLs and
 * x-default.
 *
 * The project only ships real content for these locales, so no other locale may
 * be advertised. Routing, request validation and static params still use
 * `SUPPORTED_LOCALES` from `@/types/locale`.
 */
export const SEO_LOCALES = ['tr', 'en'] as const;
export type SEOLocale = (typeof SEO_LOCALES)[number];

export const ALL_LOCALE_PATHS: readonly string[] = SEO_LOCALES;

export function isSeoLocale(value: string): value is SEOLocale {
  return (SEO_LOCALES as readonly string[]).includes(value);
}

/**
 * hreflang language map for a path: exactly `SEO_LOCALES` plus `x-default`
 * pointing at the project default locale.
 */
export function buildFullAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = Object.fromEntries(
    SEO_LOCALES.map((l) => [l, `${SITE_URL}/${l}${path}`])
  );
  languages['x-default'] = buildXDefault(path);
  return languages;
}

export function buildXDefault(path: string): string {
  return `${SITE_URL}/${DEFAULT_LOCALE}${path}`;
}

/**
 * Next.js `alternates` object for a localized page.
 *
 * Returns `undefined` for locales outside `SEO_LOCALES` so unsupported locales
 * are never advertised through canonical or alternate links.
 */
export function buildPageAlternates(locale: string, path: string): Metadata['alternates'] {
  if (!isSeoLocale(locale)) return undefined;

  return {
    canonical: `${SITE_URL}/${locale}${path}`,
    languages: buildFullAlternates(path),
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
