import { describe, it, expect, vi } from 'vitest';
import { SITE_URL } from '@/lib/seo/constants';

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

describe('Products List Page Metadata', () => {
  it('generates correct metadata with 7-locale hreflang and x-default', async () => {
    const { generateMetadata } = await import('@/app/[locale]/products/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'tr' }) });

    expect(metadata.title).toBe('Mermer Kataloğu');
    expect(metadata.description).toBeDefined();
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/products`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/products`);
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.twitter).toBeDefined();
    expect(metadata.twitter?.card).toBe('summary_large_image');

    const langs = metadata.alternates?.languages as Record<string, string>;
    expect(Object.keys(langs)).toHaveLength(8);
    expect(langs['tr']).toBe(`${SITE_URL}/tr/products`);
    expect(langs['en']).toBe(`${SITE_URL}/en/products`);
  });
});

describe('Collections List Page Metadata', () => {
  it('generates correct metadata with x-default', async () => {
    const { generateMetadata } = await import('@/app/[locale]/collections/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });

    expect(metadata.title).toBe('Collections');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/en/collections`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/collections`);
  });
});

describe('Product Detail Page Metadata', () => {
  it('generates correct metadata with x-default and openGraph', async () => {
    const { generateMetadata } = await import('@/app/[locale]/products/[slug]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'tr', slug: 'calacatta-gold' }) });

    expect(metadata.title).toBe('Calacatta Gold');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/products/calacatta-gold`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/products/calacatta-gold`);
    expect(metadata.openGraph).toBeDefined();
    expect(metadata.openGraph?.type).toBe('website');
    expect(metadata.twitter?.card).toBe('summary_large_image');
  });
});

describe('Collection Detail Page Metadata', () => {
  it('generates correct metadata', async () => {
    const { generateMetadata } = await import('@/app/[locale]/collections/[slug]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'tr', slug: 'classic-collection' }) });

    expect(metadata.title).toBe('Classic Collection');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/collections/classic-collection`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/collections/classic-collection`);
  });
});

describe('Application Detail Page Metadata', () => {
  it('generates correct metadata', async () => {
    const { generateMetadata } = await import('@/app/[locale]/applications/[slug]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'tr', slug: 'flooring' }) });

    expect(metadata.title).toBe('Flooring');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/applications/flooring`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/applications/flooring`);
  });
});

describe('Project Detail Page Metadata', () => {
  it('generates correct metadata', async () => {
    const { generateMetadata } = await import('@/app/[locale]/projects/[slug]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'tr', slug: 'marriott-hotel' }) });

    expect(metadata.title).toBe('Marriott Hotel');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/projects/marriott-hotel`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/projects/marriott-hotel`);
  });
});

describe('Journal Detail Page Metadata', () => {
  it('generates correct metadata with article type', async () => {
    const { generateMetadata } = await import('@/app/[locale]/journal/[slug]/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'tr', slug: 'marble-trends-2026' }) });

    expect(metadata.title).toBe('Marble Trends 2026');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/journal/marble-trends-2026`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/journal/marble-trends-2026`);
    expect(metadata.openGraph?.type).toBe('article');
  });
});

describe('About Page Metadata', () => {
  it('generates correct metadata', async () => {
    const { generateMetadata } = await import('@/app/[locale]/about/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'tr' }) });

    expect(metadata.title).toBe('About Us');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/about`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/about`);
  });
});

describe('Quarry Page Metadata', () => {
  it('generates correct metadata', async () => {
    const { generateMetadata } = await import('@/app/[locale]/quarry/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'tr' }) });

    expect(metadata.title).toBe('Our Quarry');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/quarry`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/quarry`);
  });
});

describe('Factory Page Metadata', () => {
  it('generates correct metadata', async () => {
    const { generateMetadata } = await import('@/app/[locale]/factory/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'tr' }) });

    expect(metadata.title).toBe('Our Factory');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/factory`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/factory`);
  });
});

describe('Contact Page Metadata', () => {
  it('generates correct metadata', async () => {
    const { generateMetadata } = await import('@/app/[locale]/contact/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'tr' }) });

    expect(metadata.title).toBe('İletişim');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/contact`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/contact`);
  });
});

describe('Quote Page Metadata', () => {
  it('generates correct metadata', async () => {
    const { generateMetadata } = await import('@/app/[locale]/quote/page');
    const metadata = await generateMetadata({ params: Promise.resolve({ locale: 'en' }) });

    expect(metadata.title).toBe('Request a Quote');
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/en/quote`);
    expect(metadata.alternates?.languages?.['x-default']).toBe(`${SITE_URL}/tr/quote`);
  });
});

describe('Hreflang Consistency', () => {
  it('all detail pages include x-default', async () => {
    const pages = [
      { module: '@/app/[locale]/products/[slug]/page', params: { locale: 'tr', slug: 'calacatta-gold' } },
      { module: '@/app/[locale]/collections/[slug]/page', params: { locale: 'tr', slug: 'classic-collection' } },
      { module: '@/app/[locale]/applications/[slug]/page', params: { locale: 'tr', slug: 'flooring' } },
      { module: '@/app/[locale]/projects/[slug]/page', params: { locale: 'tr', slug: 'marriott-hotel' } },
      { module: '@/app/[locale]/journal/[slug]/page', params: { locale: 'tr', slug: 'marble-trends-2026' } },
    ];

    for (const { module: mod, params } of pages) {
      const { generateMetadata } = await import(mod);
      const metadata = await generateMetadata({ params: Promise.resolve(params) });
      expect(metadata.alternates?.languages?.['x-default']).toBeDefined();
      expect(metadata.alternates?.languages?.['x-default']).toMatch(/^https?:\/\//);
    }
  });

  it('all list pages include x-default', async () => {
    const pages = [
      { module: '@/app/[locale]/products/page', params: { locale: 'tr' } },
      { module: '@/app/[locale]/collections/page', params: { locale: 'tr' } },
      { module: '@/app/[locale]/applications/page', params: { locale: 'tr' } },
      { module: '@/app/[locale]/projects/page', params: { locale: 'tr' } },
      { module: '@/app/[locale]/journal/page', params: { locale: 'tr' } },
    ];

    for (const { module: mod, params } of pages) {
      const { generateMetadata } = await import(mod);
      const metadata = await generateMetadata({ params: Promise.resolve(params) });
      expect(metadata.alternates?.languages?.['x-default']).toBeDefined();
      expect(metadata.alternates?.languages?.['x-default']).toMatch(/^https?:\/\//);
    }
  });
});
