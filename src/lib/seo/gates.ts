import type { Metadata } from 'next';
import { SUPPORTED_LOCALES, type Locale } from '@/types/locale';
import type { SeoAvailability, SeoCompanyPage, SeoSection } from '@/types/seo';
import type { SEOData } from '@/types/api';
import { DEFAULT_LOCALE } from '@/types/locale';
import { buildPageAlternates, isSeoLocale } from './constants';

// ============================================================
// Public SEO content gates
//
// A locale only advertises (index / hreflang / sitemap) the URLs it actually
// has published content for. The availability payload is fetched once per
// render pass and revalidated for a minute, so gates stay data-driven and
// become indexable automatically as soon as content is published.
// ============================================================

const AVAILABILITY_REVALIDATE_SECONDS = 60;

function publicBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');
  const port = process.env.PORT ?? '3000';
  return `http://localhost:${port}`;
}

export async function getSeoAvailability(): Promise<SeoAvailability> {
  const response = await fetch(
    `${publicBaseUrl()}/api/v1/public/${DEFAULT_LOCALE}/seo/availability`,
    {
      headers: { Accept: 'application/json' },
      next: { revalidate: AVAILABILITY_REVALIDATE_SECONDS },
    },
  );

  if (!response.ok) {
    throw new Error(`Unable to load SEO availability (HTTP ${response.status}).`);
  }

  const body = (await response.json()) as { data: SeoAvailability };
  return body.data;
}

export function sectionLocales(availability: SeoAvailability, section: SeoSection): Locale[] {
  return availability.sections[section];
}

export function companyLocales(availability: SeoAvailability, page: SeoCompanyPage): Locale[] {
  return availability.company[page];
}

/** Locales that have at least one published content item or company page. */
export function anyContentLocales(availability: SeoAvailability): Locale[] {
  const locales = new Set<Locale>();
  for (const list of Object.values(availability.sections)) {
    for (const locale of list) locales.add(locale);
  }
  for (const list of Object.values(availability.company)) {
    for (const locale of list) locales.add(locale);
  }
  return [...locales].sort((a, b) => SUPPORTED_LOCALES.indexOf(a) - SUPPORTED_LOCALES.indexOf(b));
}

/**
 * `alternates` (+ `robots` for locales without content) for a page whose
 * content availability was resolved per locale.
 */
export function gatedMetadata(
  locale: string,
  path: string,
  contentLocales: readonly Locale[],
): Metadata {
  const alternates = buildPageAlternates(locale, path, contentLocales);
  if (!isSeoLocale(locale) || contentLocales.includes(locale as Locale)) {
    return { alternates };
  }
  return { alternates, robots: { index: false, follow: true } };
}

/**
 * `alternates` + `robots` for a detail page, taken from the item's own SEO
 * payload so only locales that actually publish the item are advertised.
 */
export function metadataFromSeoData(seo: SEOData): Metadata {
  const alternates: Metadata['alternates'] = {
    canonical: seo.canonical,
    languages: Object.fromEntries(seo.hreflang.map((entry) => [entry.lang, entry.href])),
  };

  if (seo.robots === 'noindex') return { alternates, robots: { index: false, follow: true } };
  if (seo.robots === 'nofollow') return { alternates, robots: { follow: false } };
  return { alternates };
}
