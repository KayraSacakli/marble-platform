import type { Locale } from '@/types/locale';
import type { SEOData } from '@/types/api';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

/**
 * Build a self-referencing canonical URL for a locale + path.
 */
export function buildCanonical(locale: Locale, path: string): string {
  return `${SITE_URL}/${locale}${path}`;
}

/**
 * Build hreflang array for a content item with both locale variants.
 * Only includes locales that actually have a published variant.
 */
export function buildHreflang(
  locale: Locale,
  path: string,
  alternates: Array<{ locale: Locale; slug: string }>
): SEOData['hreflang'] {
  const entries: SEOData['hreflang'] = [];

  for (const alt of alternates) {
    entries.push({
      lang: alt.locale,
      href: buildCanonical(alt.locale, path.replace(`/${locale}/`, `/${alt.locale}/`).replace(/\/[^/]+$/, `/${alt.slug}`)),
    });
  }

  // x-default points to TR (default locale)
  const trAlt = alternates.find((a) => a.locale === 'tr');
  if (trAlt) {
    entries.push({
      lang: 'x-default',
      href: buildCanonical('tr', path.replace(`/${locale}/`, '/tr/').replace(/\/[^/]+$/, `/${trAlt.slug}`)),
    });
  }

  return entries;
}

/**
 * Build SEO data for a content variant.
 */
export function buildSEOData(options: {
  locale: Locale;
  path: string;
  name: string;
  siteName?: string;
  description?: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoCanonical?: string | null;
  seoRobots?: string | null;
  ogImageUrl?: string;
  alternates?: Array<{ locale: Locale; slug: string }>;
  structuredData?: Record<string, unknown>;
}): SEOData {
  const siteName = options.siteName || 'Premium Turkish Marble';
  const title = options.seoTitle || `${options.name} — ${siteName}`;
  const metaDescription = options.seoDescription || options.description || '';
  const canonical = options.seoCanonical || buildCanonical(options.locale, options.path);

  let robots: SEOData['robots'] = 'index';
  if (options.seoRobots) {
    const r = options.seoRobots.toUpperCase();
    if (r === 'NOINDEX' || r === 'NOFOLLOW') {
      robots = r.toLowerCase() as SEOData['robots'];
    }
  }

  return {
    title,
    metaDescription: metaDescription.slice(0, 160),
    canonical,
    robots,
    ogImage: options.ogImageUrl,
    structuredData: options.structuredData,
    hreflang: options.alternates
      ? buildHreflang(options.locale, options.path, options.alternates)
      : [{ lang: options.locale, href: canonical }],
  };
}

/**
 * Build a list-page SEO (no specific content, just the listing).
 */
export function buildListSEO(options: {
  locale: Locale;
  section: string;
  siteName?: string;
}): SEOData {
  const siteName = options.siteName || 'Premium Turkish Marble';
  const title = `${options.section} — ${siteName}`;
  const canonical = buildCanonical(options.locale, `/${options.section}`);

  return {
    title,
    metaDescription: `Browse our ${options.section.toLowerCase()}. ${siteName}.`,
    canonical,
    robots: 'index',
    hreflang: [
      { lang: options.locale, href: canonical },
      { lang: options.locale === 'tr' ? 'en' : 'tr', href: buildCanonical(options.locale === 'tr' ? 'en' : 'tr', `/${options.section}`) },
      { lang: 'x-default', href: buildCanonical('tr', `/${options.section}`) },
    ],
  };
}
