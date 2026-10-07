import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/v1/public/[locale]/seo/availability/route';
import { callHandler } from '../api/v1/public/helpers';
import {
  anyContentLocales,
  companyLocales,
  gatedMetadata,
  getSeoAvailability,
  metadataFromSeoData,
  sectionLocales,
} from '@/lib/seo/gates';
import { SITE_URL } from '@/lib/seo/constants';
import type { SEOData } from '@/types/api';
import type { SeoAvailability } from '@/types/seo';

vi.mock('@/services/content', () => ({
  contentService: { getSeoAvailability: vi.fn() },
}));

const { contentService } = await import('@/services/content');

const AVAILABILITY: SeoAvailability = {
  sections: {
    products: ['tr', 'en'],
    collections: ['tr'],
    applications: ['tr', 'en'],
    projects: [],
    journal: ['tr', 'en'],
  },
  company: { about: ['tr', 'en'], quarry: ['tr'], factory: [] },
};

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GET /api/v1/public/[locale]/seo/availability', () => {
  it('returns availability for every locale', async () => {
    (contentService.getSeoAvailability as ReturnType<typeof vi.fn>).mockResolvedValue(AVAILABILITY);

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/seo/availability', { locale: 'tr' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.sections.products).toEqual(['tr', 'en']);
    expect(json.data.company.factory).toEqual([]);
    expect(contentService.getSeoAvailability).toHaveBeenCalledTimes(1);
  });
});

describe('getSeoAvailability', () => {
  it('reads the data envelope from the availability endpoint', async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ data: AVAILABILITY }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );
    vi.stubGlobal('fetch', fetchMock);

    const availability = await getSeoAvailability();

    expect(availability).toEqual(AVAILABILITY);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0][0])).toContain('/seo/availability');
  });

  it('fails loudly when the endpoint is unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('down', { status: 503 })));

    await expect(getSeoAvailability()).rejects.toThrow(/SEO availability/);
  });
});

describe('availability selectors', () => {
  it('returns the locales that publish each section and company page', () => {
    expect(sectionLocales(AVAILABILITY, 'products')).toEqual(['tr', 'en']);
    expect(sectionLocales(AVAILABILITY, 'collections')).toEqual(['tr']);
    expect(sectionLocales(AVAILABILITY, 'projects')).toEqual([]);
    expect(companyLocales(AVAILABILITY, 'about')).toEqual(['tr', 'en']);
    expect(companyLocales(AVAILABILITY, 'factory')).toEqual([]);
  });

  it('unions every section and company page in supported locale order', () => {
    expect(anyContentLocales(AVAILABILITY)).toEqual(['tr', 'en']);
  });
});

describe('gatedMetadata', () => {
  it('stays indexable for a locale with content', () => {
    const metadata = gatedMetadata('en', '/products', ['tr', 'en']);

    expect(metadata.robots).toBeUndefined();
    expect(metadata.alternates).toEqual({
      canonical: `${SITE_URL}/en/products`,
      languages: {
        tr: `${SITE_URL}/tr/products`,
        en: `${SITE_URL}/en/products`,
        'x-default': `${SITE_URL}/tr/products`,
      },
    });
  });

  it('noindexes a locale without content and canonicals one that has it', () => {
    const metadata = gatedMetadata('es', '/products', ['tr', 'en']);

    expect(metadata.robots).toEqual({ index: false, follow: true });
    expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/tr/products`);
    expect((metadata.alternates?.languages as Record<string, string>)['es']).toBeUndefined();
  });
});

describe('metadataFromSeoData', () => {
  const seo: SEOData = {
    title: 'Calacatta Gold',
    metaDescription: 'Marble',
    canonical: `${SITE_URL}/tr/products/calacatta-gold`,
    robots: 'index',
    hreflang: [
      { lang: 'tr', href: `${SITE_URL}/tr/products/calacatta-gold` },
      { lang: 'x-default', href: `${SITE_URL}/tr/products/calacatta-gold` },
    ],
  };

  it('advertises exactly the locales that publish the item', () => {
    const metadata = metadataFromSeoData({ ...seo });

    expect(metadata.robots).toBeUndefined();
    expect(metadata.alternates).toEqual({
      canonical: `${SITE_URL}/tr/products/calacatta-gold`,
      languages: {
        tr: `${SITE_URL}/tr/products/calacatta-gold`,
        'x-default': `${SITE_URL}/tr/products/calacatta-gold`,
      },
    });
  });

  it('maps an admin NOINDEX to noindex, follow', () => {
    const metadata = metadataFromSeoData({ ...seo, robots: 'noindex' });
    expect(metadata.robots).toEqual({ index: false, follow: true });
  });

  it('maps an admin NOFOLLOW to nofollow', () => {
    const metadata = metadataFromSeoData({ ...seo, robots: 'nofollow' });
    expect(metadata.robots).toEqual({ follow: false });
  });
});
