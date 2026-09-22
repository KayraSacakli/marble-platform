import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/v1/public/[locale]/collections/route';
import { GET as GET_DETAIL } from '@/app/api/v1/public/[locale]/collections/[slug]/route';
import { callHandler, mockCollectionSummary, mockCollectionDetail } from './helpers';
import { NotFoundError } from '@/lib/api/errors';

vi.mock('@/services/content', () => ({
  contentService: {
    getCollectionList: vi.fn(),
    getCollectionDetail: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

describe('GET /api/v1/public/[locale]/collections', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns collection list with data and meta', async () => {
    (contentService.getCollectionList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockCollectionSummary],
      meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/collections', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.data).toHaveLength(1);
    expect(json.data.data[0].slug).toBe('test-collection');
    expect(json.data.meta.total).toBe(1);
  });

  it('returns empty list when no collections exist', async () => {
    (contentService.getCollectionList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/en/collections', { locale: 'en' });
    const json = await res.json();

    expect(json.data.data).toEqual([]);
  });

  it('returns 200 for valid locale', async () => {
    (contentService.getCollectionList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/collections', { locale: 'tr' });
    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET, 'http://localhost/api/v1/public/xx/collections', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });
});

describe('GET /api/v1/public/[locale]/collections/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns collection detail for valid slug', async () => {
    (contentService.getCollectionDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockCollectionDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/collections/test-collection', { locale: 'tr', slug: 'test-collection' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slug).toBe('test-collection');
    expect(json.data.name).toBe('Test Collection');
    expect(json.data.products).toBeDefined();
    expect(Array.isArray(json.data.products)).toBe(true);
  });

  it('returns 404 for missing slug', async () => {
    (contentService.getCollectionDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/collections/nonexistent', { locale: 'tr', slug: 'nonexistent' });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 for unpublished content', async () => {
    (contentService.getCollectionDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/collections/draft-collection', { locale: 'tr', slug: 'draft-collection' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for missing translation', async () => {
    (contentService.getCollectionDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/en/collections/tr-only', { locale: 'en', slug: 'tr-only' });
    expect(res.status).toBe(404);
  });

  it('includes SEO data', async () => {
    (contentService.getCollectionDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockCollectionDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/collections/test-collection', { locale: 'tr', slug: 'test-collection' });
    const json = await res.json();

    expect(json.data.seo).toBeDefined();
    expect(json.data.seo.hreflang).toBeDefined();
  });

  it('does not expose internal fields', async () => {
    (contentService.getCollectionDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockCollectionDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/collections/test-collection', { locale: 'tr', slug: 'test-collection' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('internalUser');
    expect(str).not.toContain('approval');
    expect(str).not.toContain('revision');
  });
});
