import { describe, it, expect, vi, beforeAll } from 'vitest';
import { SEO_LOCALES, SITE_URL } from '@/lib/seo/constants';

vi.mock('@/lib/data/products', () => ({ getProducts: vi.fn() }));
vi.mock('@/lib/data/collections', () => ({ getCollections: vi.fn() }));
vi.mock('@/lib/data/applications', () => ({ getApplications: vi.fn() }));
vi.mock('@/lib/data/projects', () => ({ getProjects: vi.fn() }));
vi.mock('@/lib/data/journal', () => ({ getJournal: vi.fn() }));

import sitemap from '@/app/sitemap';
import { getProducts } from '@/lib/data/products';
import { getCollections } from '@/lib/data/collections';
import { getApplications } from '@/lib/data/applications';
import { getProjects } from '@/lib/data/projects';
import { getJournal } from '@/lib/data/journal';

const JOURNAL_PUBLISHED = '2026-06-10T00:00:00.000Z';

function listPayload(
  data: Array<{ slug: string; publicationDate?: string }>,
  meta: { page: number; total: number; totalPages: number },
) {
  return { data, meta: { pageSize: 100, ...meta } };
}

beforeAll(() => {
  // products: two pages to prove pagination is followed
  vi.mocked(getProducts).mockImplementation((async (_locale, params) => {
    const page = Number(params?.page ?? 1);
    if (page === 1) {
      return listPayload([{ slug: 'demo-dark-stone' }, { slug: 'demo-white-stone' }], {
        page: 1,
        total: 3,
        totalPages: 2,
      });
    }
    return listPayload([{ slug: 'demo-gold-stone' }], { page: 2, total: 3, totalPages: 2 });
  }) as never);

  vi.mocked(getCollections).mockResolvedValue(
    listPayload([{ slug: 'classic-collection' }], { page: 1, total: 1, totalPages: 1 }) as never,
  );
  vi.mocked(getApplications).mockResolvedValue(
    listPayload([{ slug: 'flooring' }], { page: 1, total: 1, totalPages: 1 }) as never,
  );
  vi.mocked(getProjects).mockResolvedValue(
    listPayload([{ slug: 'marriott-hotel' }], { page: 1, total: 1, totalPages: 1 }) as never,
  );
  vi.mocked(getJournal).mockResolvedValue(
    listPayload(
      [{ slug: 'stone-in-contemporary-architecture', publicationDate: JOURNAL_PUBLISHED }],
      {
        page: 1,
        total: 1,
        totalPages: 1,
      },
    ) as never,
  );
});

describe('Sitemap detail URLs (Phase 18D-4)', () => {
  let entries: Awaited<ReturnType<typeof sitemap>>;

  beforeAll(async () => {
    entries = await sitemap();
  });

  it('advertises every product/collection/application/project/journal slug per locale with content', () => {
    const urls = entries.map((e) => e.url);
    for (const locale of ['tr', 'en']) {
      expect(urls).toContain(`${SITE_URL}/${locale}/products/demo-dark-stone`);
      expect(urls).toContain(`${SITE_URL}/${locale}/products/demo-white-stone`);
      expect(urls).toContain(`${SITE_URL}/${locale}/products/demo-gold-stone`); // page 2
      expect(urls).toContain(`${SITE_URL}/${locale}/collections/classic-collection`);
      expect(urls).toContain(`${SITE_URL}/${locale}/applications/flooring`);
      expect(urls).toContain(`${SITE_URL}/${locale}/projects/marriott-hotel`);
      expect(urls).toContain(`${SITE_URL}/${locale}/journal/stone-in-contemporary-architecture`);
    }
  });

  it('keeps all 20 static entries alongside the detail entries', () => {
    // 20 static (10 paths × the TR/EN content locales) + 7 detail slugs × 2 locales = 34
    expect(entries).toHaveLength(34);

    const staticOnes = entries.filter(
      (e) =>
        !/\/(products|collections|applications|projects|journal)\/[^/]+$/.test(
          new URL(e.url).pathname,
        ),
    );
    expect(staticOnes).toHaveLength(20);
  });

  it('only advertises SEO locales on detail URLs', () => {
    const allowed = new Set<string>(SEO_LOCALES);
    for (const entry of entries) {
      expect(allowed.has(new URL(entry.url).pathname.split('/').filter(Boolean)[0] ?? '')).toBe(
        true,
      );
    }
  });

  it('uses the journal publication date as lastModified for detail entries', () => {
    const journal = entries.find((e) =>
      e.url.endsWith('/journal/stone-in-contemporary-architecture'),
    )!;
    expect(journal.lastModified).toEqual(new Date(JOURNAL_PUBLISHED));
    expect(journal.changeFrequency).toBe('monthly');
    expect(journal.priority).toBe(0.6);
  });

  it('gives every detail entry a Date lastModified', () => {
    const detail = entries.filter((e) => e.priority === 0.6);
    expect(detail.length).toBe(14);
    for (const entry of detail) {
      expect(entry.lastModified).toBeInstanceOf(Date);
    }
  });
});
