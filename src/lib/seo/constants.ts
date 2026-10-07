import type { Metadata } from 'next';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@/types/locale';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
export const SITE_NAME = 'Premium Turkish Marble';
export const SITE_NAME_TR = 'Premium Türk Mermeri';

/**
 * Single authoritative source of the locales advertised in public SEO output:
 * sitemap URLs, hreflang / alternate language links, locale canonical URLs and
 * x-default.
 *
 * Routing, request validation and static params use the very same locales
 * (`SUPPORTED_LOCALES`); whether a locale is indexable for a given path is
 * decided per page by the content gates in `@/lib/seo/gates`.
 */
export const SEO_LOCALES = SUPPORTED_LOCALES;
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
 * When `contentLocales` is given it describes the locales that actually have
 * content for this path: only those are advertised through `languages`, the
 * canonical falls back to a locale that does have content and `x-default`
 * follows the preferred content locale.
 *
 * Returns `undefined` for locales outside `SEO_LOCALES` so unsupported locales
 * are never advertised through canonical or alternate links.
 */
export function buildPageAlternates(
  locale: string,
  path: string,
  contentLocales?: readonly string[]
): Metadata['alternates'] {
  if (!isSeoLocale(locale)) return undefined;

  const active = contentLocales && contentLocales.length > 0 ? contentLocales : SEO_LOCALES;
  const canonicalLocale = active.includes(locale) ? locale : preferredContentLocale(active);

  const languages: Record<string, string> = Object.fromEntries(
    active.map((l) => [l, `${SITE_URL}/${l}${path}`])
  );
  languages['x-default'] = `${SITE_URL}/${preferredContentLocale(active)}${path}`;

  return {
    canonical: `${SITE_URL}/${canonicalLocale}${path}`,
    languages,
  };
}

/** Preferred locale among the locales that have content (project default first). */
export function preferredContentLocale(contentLocales: readonly string[]): string {
  if (contentLocales.includes(DEFAULT_LOCALE)) return DEFAULT_LOCALE;
  return contentLocales[0] ?? DEFAULT_LOCALE;
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
