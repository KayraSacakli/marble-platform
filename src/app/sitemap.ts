import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/seo/constants';
import { anyContentLocales, getSeoAvailability } from '@/lib/seo/gates';
import { MAX_PAGE_SIZE } from '@/types/api';
import type { Locale } from '@/types/locale';
import type { SeoAvailability } from '@/types/seo';
import { getProducts } from '@/lib/data/products';
import { getCollections } from '@/lib/data/collections';
import { getApplications } from '@/lib/data/applications';
import { getProjects } from '@/lib/data/projects';
import { getJournal } from '@/lib/data/journal';

// Static paths are advertised only for the locales that actually have content
// for them (the /quote form is intentionally absent: it is noindex).
const STATIC_PATHS: Array<{ path: string; locales: (availability: SeoAvailability) => Locale[] }> = [
  { path: '', locales: anyContentLocales },
  { path: '/products', locales: (a) => a.sections.products },
  { path: '/collections', locales: (a) => a.sections.collections },
  { path: '/applications', locales: (a) => a.sections.applications },
  { path: '/projects', locales: (a) => a.sections.projects },
  { path: '/journal', locales: (a) => a.sections.journal },
  { path: '/about', locales: (a) => a.company.about },
  { path: '/quarry', locales: (a) => a.company.quarry },
  { path: '/factory', locales: (a) => a.company.factory },
  { path: '/contact', locales: anyContentLocales },
];

type DetailSummary = { slug: string; publicationDate?: string };

type DetailSource = {
  basePath: string;
  fetchPage: (
    locale: Locale,
    params?: Record<string, string | number>
  ) => Promise<{ data: DetailSummary[]; meta: { totalPages: number } }>;
};

const DETAIL_SOURCES: DetailSource[] = [
  { basePath: '/products', fetchPage: getProducts as DetailSource['fetchPage'] },
  { basePath: '/collections', fetchPage: getCollections as DetailSource['fetchPage'] },
  { basePath: '/applications', fetchPage: getApplications as DetailSource['fetchPage'] },
  { basePath: '/projects', fetchPage: getProjects as DetailSource['fetchPage'] },
  { basePath: '/journal', fetchPage: getJournal as DetailSource['fetchPage'] },
];

async function collectDetailEntries(locale: Locale, source: DetailSource): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  let page = 1;
  let totalPages = 1;

  do {
    const result = await source.fetchPage(locale, { page, pageSize: MAX_PAGE_SIZE });

    for (const item of result.data) {
      entries.push({
        url: `${SITE_URL}/${locale}${source.basePath}/${item.slug}`,
        lastModified: item.publicationDate ? new Date(item.publicationDate) : new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    }

    totalPages = result.meta.totalPages;
    page += 1;
  } while (page <= totalPages);

  return entries;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  const availability = await getSeoAvailability();

  for (const { path, locales } of STATIC_PATHS) {
    for (const locale of locales(availability)) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1.0 : path === '/products' ? 0.9 : 0.7,
      });
    }
  }

  // Detail URLs: every published slug of the five detail-backed sections.
  // Fetch failures propagate (no catch) so a dead API fails the build
  // loudly instead of publishing a sitemap without detail URLs. Locales
  // without a single published item in any section are skipped entirely.
  const detailLocales = [...new Set(Object.values(availability.sections).flat())];
  for (const locale of detailLocales) {
    for (const source of DETAIL_SOURCES) {
      entries.push(...(await collectDetailEntries(locale, source)));
    }
  }

  return entries;
}
