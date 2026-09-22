import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/v1/public/[locale]/products/route';
import { GET as GET_DETAIL } from '@/app/api/v1/public/[locale]/products/[slug]/route';
import { callHandler, mockProductSummary, mockProductDetail } from './helpers';
import { NotFoundError } from '@/lib/api/errors';

vi.mock('@/services/content', () => ({
  contentService: {
    getProductList: vi.fn(),
    getProductDetail: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

describe('GET /api/v1/public/[locale]/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns product list with data and meta', async () => {
    (contentService.getProductList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockProductSummary],
      meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/products', { locale: 'tr' });
    const json = await res.json();

    expect(json.data).toBeDefined();
    expect(json.data.data).toHaveLength(1);
    expect(json.data.data[0].slug).toBe('test-product');
    expect(json.data.meta).toBeDefined();
    expect(json.data.meta.page).toBe(1);
    expect(json.data.meta.total).toBe(1);
  });

  it('returns empty list when no products exist', async () => {
    (contentService.getProductList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/products', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.data).toEqual([]);
    expect(json.data.meta.total).toBe(0);
  });

  it('returns 200 with TR locale', async () => {
    (contentService.getProductList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockProductSummary],
      meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/products', { locale: 'tr' });
    expect(res.status).toBe(200);
    expect(contentService.getProductList).toHaveBeenCalledWith('tr');
  });

  it('returns 200 with EN locale', async () => {
    (contentService.getProductList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockProductSummary],
      meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/en/products', { locale: 'en' });
    expect(res.status).toBe(200);
    expect(contentService.getProductList).toHaveBeenCalledWith('en');
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET, 'http://localhost/api/v1/public/xx/products', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
    expect(json.error.code).toBe('BAD_REQUEST');
  });

  it('returns requestId header', async () => {
    (contentService.getProductList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/products', { locale: 'tr' });
    expect(res.headers.get('x-request-id')).toBeDefined();
  });
});

describe('GET /api/v1/public/[locale]/products/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns product detail for valid slug', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.data.slug).toBe('test-product');
    expect(json.data.name).toBe('Test Product');
    expect(json.data.description).toBe('Test product description');
  });

  it('returns 404 for missing slug', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/nonexistent', { locale: 'tr', slug: 'nonexistent' });
    const json = await res.json();

    expect(res.status).toBe(404);
    expect(json.error).toBeDefined();
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('returns 404 for unpublished content', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/draft-product', { locale: 'tr', slug: 'draft-product' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for missing translation (no fallback)', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/en/products/tr-only-product', { locale: 'en', slug: 'tr-only-product' });
    expect(res.status).toBe(404);
  });

  it('includes SEO data in detail response', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    const json = await res.json();

    expect(json.data.seo).toBeDefined();
    expect(json.data.seo.title).toBeDefined();
    expect(json.data.seo.canonical).toBeDefined();
    expect(json.data.seo.hreflang).toBeDefined();
    expect(Array.isArray(json.data.seo.hreflang)).toBe(true);
  });

  it('includes related content in product detail', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    const json = await res.json();

    expect(json.data.collections).toBeDefined();
    expect(Array.isArray(json.data.collections)).toBe(true);
    expect(json.data.applications).toBeDefined();
    expect(Array.isArray(json.data.applications)).toBe(true);
    expect(json.data.projects).toBeDefined();
    expect(Array.isArray(json.data.projects)).toBe(true);
    expect(json.data.relatedProducts).toBeDefined();
    expect(Array.isArray(json.data.relatedProducts)).toBe(true);
  });

  it('includes quoteContextIdentifier', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    const json = await res.json();

    expect(json.data.quoteContextIdentifier).toBeDefined();
    expect(typeof json.data.quoteContextIdentifier).toBe('string');
    expect(json.data.quoteContextIdentifier).toMatch(/^product:/);
  });

  it('does not expose internal fields', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    const json = await res.json();
    const responseStr = JSON.stringify(json);

    expect(responseStr).not.toContain('internalUser');
    expect(responseStr).not.toContain('password');
    expect(responseStr).not.toContain('secret');
    expect(responseStr).not.toContain('approval');
    expect(responseStr).not.toContain('revision');
    expect(responseStr).not.toContain('auditEvent');
  });

  it('returns requestId header', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    expect(res.headers.get('x-request-id')).toBeDefined();
  });
});
