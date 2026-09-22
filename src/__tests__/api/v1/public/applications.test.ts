import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/v1/public/[locale]/applications/route';
import { GET as GET_DETAIL } from '@/app/api/v1/public/[locale]/applications/[slug]/route';
import { callHandler, mockApplicationSummary, mockApplicationDetail } from './helpers';
import { NotFoundError } from '@/lib/api/errors';

vi.mock('@/services/content', () => ({
  contentService: {
    getApplicationList: vi.fn(),
    getApplicationDetail: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

describe('GET /api/v1/public/[locale]/applications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns application list with data and meta', async () => {
    (contentService.getApplicationList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockApplicationSummary],
      meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/applications', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.data).toHaveLength(1);
    expect(json.data.data[0].slug).toBe('test-application');
  });

  it('returns 200 for EN locale', async () => {
    (contentService.getApplicationList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/en/applications', { locale: 'en' });
    expect(res.status).toBe(200);
    expect(contentService.getApplicationList).toHaveBeenCalledWith('en');
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET, 'http://localhost/api/v1/public/xx/applications', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });
});

describe('GET /api/v1/public/[locale]/applications/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns application detail for valid slug', async () => {
    (contentService.getApplicationDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockApplicationDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/applications/test-application', { locale: 'tr', slug: 'test-application' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slug).toBe('test-application');
    expect(json.data.products).toBeDefined();
    expect(json.data.projects).toBeDefined();
    expect(json.data.journalArticles).toBeDefined();
  });

  it('returns 404 for missing slug', async () => {
    (contentService.getApplicationDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/applications/nonexistent', { locale: 'tr', slug: 'nonexistent' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for unpublished content', async () => {
    (contentService.getApplicationDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/applications/draft-app', { locale: 'tr', slug: 'draft-app' });
    expect(res.status).toBe(404);
  });

  it('includes SEO data', async () => {
    (contentService.getApplicationDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockApplicationDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/applications/test-application', { locale: 'tr', slug: 'test-application' });
    const json = await res.json();

    expect(json.data.seo).toBeDefined();
    expect(json.data.seo.hreflang).toBeDefined();
    expect(Array.isArray(json.data.seo.hreflang)).toBe(true);
  });

  it('does not expose internal fields', async () => {
    (contentService.getApplicationDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockApplicationDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/applications/test-application', { locale: 'tr', slug: 'test-application' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('internalUser');
    expect(str).not.toContain('approval');
    expect(str).not.toContain('password');
  });
});
