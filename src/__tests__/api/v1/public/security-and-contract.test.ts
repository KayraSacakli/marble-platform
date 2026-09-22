import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/v1/public/[locale]/products/route';
import { GET as GET_DETAIL } from '@/app/api/v1/public/[locale]/products/[slug]/route';
import { GET as GET_COLL_DETAIL } from '@/app/api/v1/public/[locale]/collections/[slug]/route';
import { callHandler, mockProductSummary, mockProductDetail, mockCollectionDetail } from './helpers';
import { NotFoundError } from '@/lib/api/errors';

vi.mock('@/services/content', () => ({
  contentService: {
    getProductList: vi.fn(),
    getProductDetail: vi.fn(),
    getCollectionDetail: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

describe('Security / Response Leakage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list response does not contain internal user data', async () => {
    (contentService.getProductList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockProductSummary],
      meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/products', { locale: 'tr' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('internalUser');
    expect(str).not.toContain('InternalUser');
    expect(str).not.toContain('password');
    expect(str).not.toContain('secret');
    expect(str).not.toContain('apiKey');
    expect(str).not.toContain('database');
    expect(str).not.toContain('connectionString');
  });

  it('detail response does not contain approval internals', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('approverId');
    expect(str).not.toContain('coveredAssets');
    expect(str).not.toContain('coveredLocale');
  });

  it('detail response does not contain revision data', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('ContentRevision');
    expect(str).not.toContain('revisionNumber');
    expect(str).not.toContain('materialSnapshot');
    expect(str).not.toContain('authorId');
  });

  it('detail response does not contain audit data', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('AuditEvent');
    expect(str).not.toContain('auditEvent');
  });

  it('detail response does not contain raw Prisma internals', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('$connect');
    expect(str).not.toContain('$disconnect');
    expect(str).not.toContain('_count');
  });

  it('error response does not contain stack traces', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/nonexistent', { locale: 'tr', slug: 'nonexistent' });
    const json = await res.json();

    expect(json.error.stack).toBeUndefined();
    expect(json.error.trace).toBeUndefined();
  });

  it('error response does not contain database messages', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('relation "public.content_variants" does not exist')
    );

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test', { locale: 'tr', slug: 'test' });
    const json = await res.json();

    expect(json.error.message).not.toContain('relation');
    expect(json.error.message).not.toContain('pg_');
  });
});

describe('Related Content Depth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('product detail related products are summaries only (depth 1)', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProductDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/products/test-product', { locale: 'tr', slug: 'test-product' });
    const json = await res.json();

    expect(json.data.relatedProducts).toBeDefined();
    expect(json.data.relatedProducts.length).toBe(1);

    const related = json.data.relatedProducts[0];
    expect(related.id).toBeDefined();
    expect(related.name).toBeDefined();
    expect(related.slug).toBeDefined();

    expect(related.relatedProducts).toBeUndefined();
    expect(related.collections).toBeUndefined();
    expect(related.applications).toBeUndefined();
    expect(related.projects).toBeUndefined();
    expect(related.journalArticles).toBeUndefined();
    expect(related.gallery).toBeUndefined();
    expect(related.seo).toBeUndefined();
  });

  it('collection detail products are summaries only (depth 1)', async () => {
    (contentService.getCollectionDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockCollectionDetail);

    const res = await callHandler(GET_COLL_DETAIL, 'http://localhost/api/v1/public/tr/collections/test-collection', { locale: 'tr', slug: 'test-collection' });
    const json = await res.json();

    if (json.data.products && json.data.products.length > 0) {
      const product = json.data.products[0];
      expect(product.relatedProducts).toBeUndefined();
      expect(product.collections).toBeUndefined();
    }
  });
});

describe('Pagination Contract', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('list response includes meta with correct shape', async () => {
    (contentService.getProductList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockProductSummary],
      meta: { page: 1, pageSize: 24, total: 50, totalPages: 3 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/products', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.meta).toBeDefined();
    expect(json.data.meta.page).toBe(1);
    expect(json.data.meta.pageSize).toBe(24);
    expect(json.data.meta.total).toBe(50);
    expect(json.data.meta.totalPages).toBe(3);
  });

  it('meta.totalPages is calculated correctly', async () => {
    (contentService.getProductList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 100, totalPages: 5 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/products', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.meta.totalPages).toBe(5);
  });
});

describe('Locale Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('TR locale passes correctly to service', async () => {
    (contentService.getProductList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    await callHandler(GET, 'http://localhost/api/v1/public/tr/products', { locale: 'tr' });
    expect(contentService.getProductList).toHaveBeenCalledWith('tr');
  });

  it('EN locale passes correctly to service', async () => {
    (contentService.getProductList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    await callHandler(GET, 'http://localhost/api/v1/public/en/products', { locale: 'en' });
    expect(contentService.getProductList).toHaveBeenCalledWith('en');
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET, 'http://localhost/api/v1/public/xx/products', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });

  it('returns 400 for empty locale', async () => {
    const res = await callHandler(GET, 'http://localhost/api/v1/public//products', { locale: '' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });

  it('missing translation returns 404 (no fallback)', async () => {
    (contentService.getProductDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(
      GET_DETAIL,
      'http://localhost/api/v1/public/en/products/tr-only-product',
      { locale: 'en', slug: 'tr-only-product' }
    );
    expect(res.status).toBe(404);
  });
});
