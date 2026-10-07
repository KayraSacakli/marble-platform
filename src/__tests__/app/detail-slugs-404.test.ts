import { describe, it, expect, vi, afterEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import ProductDetailPage from '@/app/[locale]/products/[slug]/page';
import JournalDetailPage from '@/app/[locale]/journal/[slug]/page';
import { ApiClientError } from '@/lib/api/client-errors';
import type { ProductDetail, JournalDetail } from '@/types/api';

vi.mock('@/lib/data/products', () => ({
  getProduct: vi.fn(),
}));

vi.mock('@/lib/data/journal', () => ({
  getJournalArticle: vi.fn(),
}));

const { getProduct } = await import('@/lib/data/products');
const journalModule = await import('@/lib/data/journal');

const notFoundError = () => new ApiClientError('Not found', 404, 'NOT_FOUND');

const productFixture: ProductDetail = {
  id: 'prod-001',
  name: 'Carrara Marble',
  slug: 'carrara-marble',
  tagline: 'Italian white marble',
  description: '<p>Luxury marble</p>',
  primaryImage: {
    id: 'img-1',
    mediaType: 'image',
    src: '/images/carrara.jpg',
    width: 1200,
    height: 800,
    aspectRatio: '3/2',
    alt: 'Carrara marble slab',
    loading: 'lazy' as const,
  },
  seo: { metaDescription: 'Carrara marble' },
  collections: [],
  applications: [],
  projects: [],
  relatedProducts: [],
  journalArticles: [],
  gallery: [],
  quoteContextIdentifier: 'product:prod-001',
} as unknown as ProductDetail;

const journalFixture: JournalDetail = {
  id: 'journ-001',
  title: 'Stone Selection Guide',
  slug: 'stone-selection-guide',
  summary: 'How to select natural stone',
  body: '<p>Article body</p>',
  publicationDate: '2026-01-15T00:00:00.000Z',
  author: 'Editorial Team',
  seo: { metaDescription: 'Stone selection' },
  coverImage: null,
  relatedProducts: [],
  relatedApplications: [],
  relatedProjects: [],
  relatedArticles: [],
} as unknown as JournalDetail;

/**
 * `notFound()` throws an error carrying the digest Next.js uses to map the
 * render onto HTTP 404 (see next/dist/client/components/http-access-fallback).
 * A real 404 therefore requires this digest to propagate out of the page
 * component before the response body is streamed.
 */
function expectNotFoundDigest(error: unknown) {
  expect(error).toBeInstanceOf(Error);
  expect((error as { digest?: string }).digest).toBe('NEXT_HTTP_ERROR_FALLBACK;404');
}

async function renderOrCatch(
  Page: typeof ProductDetailPage,
  locale: string,
  slug: string,
): Promise<{ rendered: boolean; error?: unknown }> {
  try {
    await Page({ params: Promise.resolve({ locale, slug }) });
    return { rendered: true };
  } catch (error) {
    return { rendered: false, error };
  }
}

afterEach(() => {
  vi.mocked(getProduct).mockReset();
  vi.mocked(journalModule.getJournalArticle).mockReset();
});

describe('Soft-404 regression: missing slugs throw the HTTP 404 digest', () => {
  it('missing TR product slug throws NEXT_HTTP_ERROR_FALLBACK;404', async () => {
    vi.mocked(getProduct).mockRejectedValueOnce(notFoundError());
    const result = await renderOrCatch(ProductDetailPage, 'tr', 'missing-product');
    expect(result.rendered).toBe(false);
    expectNotFoundDigest(result.error);
  });

  it('missing EN product slug throws NEXT_HTTP_ERROR_FALLBACK;404', async () => {
    vi.mocked(getProduct).mockRejectedValueOnce(notFoundError());
    const result = await renderOrCatch(ProductDetailPage, 'en', 'missing-product');
    expect(result.rendered).toBe(false);
    expectNotFoundDigest(result.error);
  });

  it('missing TR journal slug throws NEXT_HTTP_ERROR_FALLBACK;404', async () => {
    vi.mocked(journalModule.getJournalArticle).mockRejectedValueOnce(notFoundError());
    const result = await renderOrCatch(JournalDetailPage, 'tr', 'missing-article');
    expect(result.rendered).toBe(false);
    expectNotFoundDigest(result.error);
  });

  it('missing EN journal slug throws NEXT_HTTP_ERROR_FALLBACK;404', async () => {
    vi.mocked(journalModule.getJournalArticle).mockRejectedValueOnce(notFoundError());
    const result = await renderOrCatch(JournalDetailPage, 'en', 'missing-article');
    expect(result.rendered).toBe(false);
    expectNotFoundDigest(result.error);
  });
});

describe('Valid slugs still render (HTTP 200)', () => {
  it('renders TR product detail', async () => {
    vi.mocked(getProduct).mockResolvedValueOnce(productFixture);
    const result = await renderOrCatch(ProductDetailPage, 'tr', 'carrara-marble');
    expect(result.rendered).toBe(true);
    expect(vi.mocked(getProduct)).toHaveBeenCalledWith('tr', 'carrara-marble');
  });

  it('renders EN product detail', async () => {
    vi.mocked(getProduct).mockResolvedValueOnce(productFixture);
    const result = await renderOrCatch(ProductDetailPage, 'en', 'carrara-marble');
    expect(result.rendered).toBe(true);
    expect(vi.mocked(getProduct)).toHaveBeenCalledWith('en', 'carrara-marble');
  });

  it('renders TR journal detail', async () => {
    vi.mocked(journalModule.getJournalArticle).mockResolvedValueOnce(journalFixture);
    const result = await renderOrCatch(JournalDetailPage, 'tr', 'stone-selection-guide');
    expect(result.rendered).toBe(true);
    expect(vi.mocked(journalModule.getJournalArticle)).toHaveBeenCalledWith(
      'tr',
      'stone-selection-guide',
    );
  });

  it('renders EN journal detail', async () => {
    vi.mocked(journalModule.getJournalArticle).mockResolvedValueOnce(journalFixture);
    const result = await renderOrCatch(JournalDetailPage, 'en', 'stone-selection-guide');
    expect(result.rendered).toBe(true);
    expect(vi.mocked(journalModule.getJournalArticle)).toHaveBeenCalledWith(
      'en',
      'stone-selection-guide',
    );
  });
});

describe('Root cause guard: no locale-level streaming boundary', () => {
  it('does not ship a [locale]/loading.tsx Suspense boundary', () => {
    const loadingPath = path.join(process.cwd(), 'src', 'app', '[locale]', 'loading.tsx');
    expect(fs.existsSync(loadingPath)).toBe(false);
  });

  it('keeps the branded [locale]/not-found.tsx in place', () => {
    const notFoundPath = path.join(process.cwd(), 'src', 'app', '[locale]', 'not-found.tsx');
    expect(fs.existsSync(notFoundPath)).toBe(true);
  });

  it('pages still call notFound() for unknown locales', async () => {
    const result = await renderOrCatch(ProductDetailPage, 'xx', 'carrara-marble');
    expect(result.rendered).toBe(false);
    expectNotFoundDigest(result.error);
  });
});
