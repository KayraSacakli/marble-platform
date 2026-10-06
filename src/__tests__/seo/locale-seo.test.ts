import { describe, it, expect, vi, beforeAll } from 'vitest';
import {
  SEO_LOCALES,
  SITE_URL,
  buildFullAlternates,
  buildPageAlternates,
  isSeoLocale,
} from '@/lib/seo/constants';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/types/locale';

vi.mock('@/lib/fonts', () => ({
  inter: { variable: '--font-body' },
  playfairDisplay: { variable: '--font-display' },
}));

vi.mock('@/lib/data/products', () => ({
  getProducts: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, totalPages: 0, total: 0 } }),
  getProduct: vi.fn().mockResolvedValue({
    id: 'prod-001',
    name: 'Calacatta Gold',
    slug: 'calacatta-gold',
    tagline: 'Premium Italian marble',
    description: 'A luxury marble',
    primaryImage: { src: '/images/calacatta.jpg', alt: 'Calacatta', width: 1200, height: 800 },
    seo: { metaDescription: 'Calacatta Gold marble' },
    collections: [],
    applications: [],
    projects: [],
    relatedProducts: [],
    journalArticles: [],
    gallery: [],
    quoteContextIdentifier: 'product:prod-001',
  }),
}));

vi.mock('@/lib/data/collections', () => ({
  getCollections: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, totalPages: 0, total: 0 } }),
  getCollection: vi.fn().mockResolvedValue({
    id: 'coll-001',
    name: 'Classic Collection',
    slug: 'classic-collection',
    description: 'Timeless classics',
    products: [],
    applications: [],
    seo: { metaDescription: 'Classic marble collection' },
  }),
}));

vi.mock('@/lib/data/applications', () => ({
  getApplications: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, totalPages: 0, total: 0 } }),
  getApplication: vi.fn().mockResolvedValue({
    id: 'app-001',
    name: 'Flooring',
    slug: 'flooring',
    description: 'Marble flooring solutions',
    products: [],
    projects: [],
    journalArticles: [],
    seo: { metaDescription: 'Marble flooring' },
  }),
}));

vi.mock('@/lib/data/projects', () => ({
  getProjects: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, totalPages: 0, total: 0 } }),
  getProject: vi.fn().mockResolvedValue({
    id: 'proj-001',
    name: 'Marriott Hotel',
    slug: 'marriott-hotel',
    description: 'Hotel lobby project',
    products: [],
    applications: [],
    seo: { metaDescription: 'Marriott hotel project' },
  }),
}));

vi.mock('@/lib/data/journal', () => ({
  getJournal: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, totalPages: 0, total: 0 } }),
  getJournalArticle: vi.fn().mockResolvedValue({
    id: 'journ-001',
    title: 'Marble Trends 2026',
    slug: 'marble-trends-2026',
    summary: 'Latest trends in marble',
    body: 'Full article body',
    publicationDate: '2026-01-15T00:00:00.000Z',
    author: 'Test Author',
    seo: { metaDescription: 'Marble trends' },
    coverImage: null,
    relatedProducts: [],
    relatedApplications: [],
    relatedProjects: [],
    relatedArticles: [],
  }),
}));

vi.mock('@/lib/data/company', () => ({
  getAbout: vi.fn().mockResolvedValue({ id: 'about-1', name: 'About Us', slug: 'about-us', description: 'About description', coverImage: null }),
  getQuarry: vi.fn().mockResolvedValue({ id: 'quarry-1', name: 'Our Quarry', slug: 'our-quarry', description: 'Quarry description', coverImage: null }),
  getFactory: vi.fn().mockResolvedValue({ id: 'factory-1', name: 'Our Factory', slug: 'our-factory', description: 'Factory description', coverImage: null }),
}));

import sitemap from '@/app/sitemap';

const UNSUPPORTED_LOCALES = SUPPORTED_LOCALES.filter(
  (l) => !(SEO_LOCALES as readonly string[]).includes(l)
);

const EXPECTED_STATIC_PATHS = [
  '',
  '/products',
  '/collections',
  '/applications',
  '/projects',
  '/journal',
  '/about',
  '/quarry',
  '/factory',
  '/contact',
  '/quote',
];

function localeOf(url: string): string {
  const pathname = new URL(url).pathname;
  return pathname.split('/').filter(Boolean)[0] ?? '';
}

function staticPathOf(url: string): string {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  return parts.slice(1).length ? `/${parts.slice(1).join('/')}` : '';
}

type SitemapEntries = Awaited<ReturnType<typeof sitemap>>;

describe('Sitemap advertises only supported content locales', () => {
  // sitemap() is async since 18D-4 (detail URL collection); the data-layer
  // mocks above resolve with empty lists, so only static entries are built.
  let entries: SitemapEntries;

  beforeAll(async () => {
    entries = await sitemap();
  });

  it('contains TR and EN localized URLs', () => {
    const urls = entries.map((e) => e.url);
    for (const locale of SEO_LOCALES) {
      expect(urls).toContain(`${SITE_URL}/${locale}`);
      expect(urls).toContain(`${SITE_URL}/${locale}/products`);
      expect(urls).toContain(`${SITE_URL}/${locale}/journal`);
      expect(urls).toContain(`${SITE_URL}/${locale}/quote`);
    }
  });

  it('contains no unsupported locale URLs', () => {
    const locales = new Set(entries.map((e) => localeOf(e.url)));
    expect(locales).toEqual(new Set(SEO_LOCALES));
    for (const unsupported of UNSUPPORTED_LOCALES) {
      expect(urlsFor(entries, unsupported)).toHaveLength(0);
    }
  });

  it('preserves existing non-locale sitemap behavior', () => {
    expect(entries).toHaveLength(SEO_LOCALES.length * EXPECTED_STATIC_PATHS.length);

    const paths = new Set(entries.map((e) => staticPathOf(e.url)));
    expect([...paths].sort()).toEqual([...EXPECTED_STATIC_PATHS].sort());

    const home = entries.find((e) => staticPathOf(e.url) === '')!;
    expect(home.changeFrequency).toBe('weekly');
    expect(home.priority).toBe(1.0);

    const products = entries.find((e) => staticPathOf(e.url) === '/products')!;
    expect(products.changeFrequency).toBe('monthly');
    expect(products.priority).toBe(0.9);

    const contact = entries.find((e) => staticPathOf(e.url) === '/contact')!;
    expect(contact.changeFrequency).toBe('monthly');
    expect(contact.priority).toBe(0.7);

    expect(entries.every((e) => typeof e.lastModified === 'object' && e.lastModified !== null)).toBe(true);
  });
});

function urlsFor(entries: SitemapEntries, locale: string): string[] {
  return entries.filter((e) => localeOf(e.url) === locale).map((e) => e.url);
}

describe('SEO locale source', () => {
  it('is exactly the locales with real content', () => {
    expect([...SEO_LOCALES]).toEqual(['tr', 'en']);
    expect(DEFAULT_LOCALE).toBe('tr');
    expect(isSeoLocale('tr')).toBe(true);
    expect(isSeoLocale('en')).toBe(true);
    for (const unsupported of UNSUPPORTED_LOCALES) {
      expect(isSeoLocale(unsupported)).toBe(false);
    }
  });
});

describe('Hreflang / alternates', () => {
  const paths = ['', '/products', '/products/calacatta-gold', '/journal/marble-trends-2026', '/quote'];

  it('emits exactly tr, en and x-default for every localized path', () => {
    for (const path of paths) {
      const languages = buildFullAlternates(path);
      expect(Object.keys(languages).sort()).toEqual(['en', 'tr', 'x-default']);
      expect(languages['tr']).toBe(`${SITE_URL}/tr${path}`);
      expect(languages['en']).toBe(`${SITE_URL}/en${path}`);
      expect(languages['x-default']).toBe(`${SITE_URL}/${DEFAULT_LOCALE}${path}`);
    }
  });

  it('never advertises unsupported locales in alternates', () => {
    for (const path of paths) {
      const languages = buildFullAlternates(path);
      for (const unsupported of UNSUPPORTED_LOCALES) {
        expect(languages[unsupported]).toBeUndefined();
        expect(Object.keys(languages)).not.toContain(unsupported);
      }
    }
  });
});

describe('Canonical generation', () => {
  it('keeps canonical correct for TR and EN', () => {
    expect(buildPageAlternates('tr', '/products')).toEqual({
      canonical: `${SITE_URL}/tr/products`,
      languages: buildFullAlternates('/products'),
    });
    expect(buildPageAlternates('en', '/products')).toEqual({
      canonical: `${SITE_URL}/en/products`,
      languages: buildFullAlternates('/products'),
    });
    expect(buildPageAlternates('tr', '/products/calacatta-gold')?.canonical).toBe(
      `${SITE_URL}/tr/products/calacatta-gold`
    );
    expect(buildPageAlternates('en', '')?.canonical).toBe(`${SITE_URL}/en`);
  });

  it('does not generate canonical or alternates for unsupported locales', () => {
    for (const unsupported of UNSUPPORTED_LOCALES) {
      expect(buildPageAlternates(unsupported, '/products')).toBeUndefined();
      expect(buildPageAlternates(unsupported, '')).toBeUndefined();
    }
  });
});

type PageCase = { module: string; path: string; params: Record<string, string> };

const LOCALIZED_PAGES: PageCase[] = [
  { module: '@/app/[locale]/layout', path: '', params: { locale: 'tr' } },
  { module: '@/app/[locale]/page', path: '', params: { locale: 'tr' } },
  { module: '@/app/[locale]/products/page', path: '/products', params: { locale: 'tr' } },
  { module: '@/app/[locale]/products/[slug]/page', path: '/products/calacatta-gold', params: { locale: 'tr', slug: 'calacatta-gold' } },
  { module: '@/app/[locale]/collections/page', path: '/collections', params: { locale: 'tr' } },
  { module: '@/app/[locale]/collections/[slug]/page', path: '/collections/classic-collection', params: { locale: 'tr', slug: 'classic-collection' } },
  { module: '@/app/[locale]/applications/page', path: '/applications', params: { locale: 'tr' } },
  { module: '@/app/[locale]/applications/[slug]/page', path: '/applications/flooring', params: { locale: 'tr', slug: 'flooring' } },
  { module: '@/app/[locale]/projects/page', path: '/projects', params: { locale: 'tr' } },
  { module: '@/app/[locale]/projects/[slug]/page', path: '/projects/marriott-hotel', params: { locale: 'tr', slug: 'marriott-hotel' } },
  { module: '@/app/[locale]/journal/page', path: '/journal', params: { locale: 'tr' } },
  { module: '@/app/[locale]/journal/[slug]/page', path: '/journal/marble-trends-2026', params: { locale: 'tr', slug: 'marble-trends-2026' } },
  { module: '@/app/[locale]/about/page', path: '/about', params: { locale: 'tr' } },
  { module: '@/app/[locale]/quarry/page', path: '/quarry', params: { locale: 'tr' } },
  { module: '@/app/[locale]/factory/page', path: '/factory', params: { locale: 'tr' } },
  { module: '@/app/[locale]/contact/page', path: '/contact', params: { locale: 'tr' } },
  { module: '@/app/[locale]/quote/page', path: '/quote', params: { locale: 'tr' } },
];

describe('Public pages still generate metadata with tr/en only', () => {
  it.each(LOCALIZED_PAGES)('$module advertises exactly tr/en/x-default', async ({ module: mod, path, params }) => {
    const { generateMetadata } = await import(mod);
    const metadata = await generateMetadata({ params: Promise.resolve(params) });

    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr${path}`);

    const languages = metadata.alternates?.languages as Record<string, string>;
    expect(Object.keys(languages).sort()).toEqual(['en', 'tr', 'x-default']);
    expect(languages['tr']).toBe(`${SITE_URL}/tr${path}`);
    expect(languages['en']).toBe(`${SITE_URL}/en${path}`);
    expect(languages['x-default']).toBe(`${SITE_URL}/${DEFAULT_LOCALE}${path}`);
  });

  it.each(LOCALIZED_PAGES)('$module keeps EN canonical correct', async ({ module: mod, path, params }) => {
    const { generateMetadata } = await import(mod);
    const metadata = await generateMetadata({
      params: Promise.resolve({ ...params, locale: 'en' }),
    });

    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/en${path}`);
    const languages = metadata.alternates?.languages as Record<string, string>;
    expect(Object.keys(languages).sort()).toEqual(['en', 'tr', 'x-default']);
  });

  it.each(LOCALIZED_PAGES)('$module does not advertise unsupported locales', async ({ module: mod, params }) => {
    const { generateMetadata } = await import(mod);
    const metadata = await generateMetadata({
      params: Promise.resolve({ ...params, locale: 'es' }),
    });

    expect(metadata.alternates).toBeUndefined();
  });
});
