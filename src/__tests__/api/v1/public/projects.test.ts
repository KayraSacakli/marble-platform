import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/v1/public/[locale]/projects/route';
import { GET as GET_DETAIL } from '@/app/api/v1/public/[locale]/projects/[slug]/route';
import { callHandler, mockProjectSummary, mockProjectDetail } from './helpers';
import { NotFoundError } from '@/lib/api/errors';

vi.mock('@/services/content', () => ({
  contentService: {
    getProjectList: vi.fn(),
    getProjectDetail: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

describe('GET /api/v1/public/[locale]/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns project list with data and meta', async () => {
    (contentService.getProjectList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockProjectSummary],
      meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/projects', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.data).toHaveLength(1);
    expect(json.data.data[0].slug).toBe('test-project');
  });

  it('returns 200 for EN locale', async () => {
    (contentService.getProjectList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/en/projects', { locale: 'en' });
    expect(res.status).toBe(200);
    expect(contentService.getProjectList).toHaveBeenCalledWith('en');
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET, 'http://localhost/api/v1/public/xx/projects', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });
});

describe('GET /api/v1/public/[locale]/projects/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns project detail for valid slug', async () => {
    (contentService.getProjectDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjectDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/projects/test-project', { locale: 'tr', slug: 'test-project' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slug).toBe('test-project');
    expect(json.data.location).toBe('Istanbul, Turkey');
    expect(json.data.projectType).toBe('HOTEL');
    expect(json.data.gallery).toBeDefined();
    expect(Array.isArray(json.data.gallery)).toBe(true);
    expect(json.data.products).toBeDefined();
    expect(json.data.applications).toBeDefined();
  });

  it('returns 404 for missing slug', async () => {
    (contentService.getProjectDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/projects/nonexistent', { locale: 'tr', slug: 'nonexistent' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for unpublished content', async () => {
    (contentService.getProjectDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/projects/draft-project', { locale: 'tr', slug: 'draft-project' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for missing translation', async () => {
    (contentService.getProjectDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/en/projects/tr-only-project', { locale: 'en', slug: 'tr-only-project' });
    expect(res.status).toBe(404);
  });

  it('includes SEO data', async () => {
    (contentService.getProjectDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjectDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/projects/test-project', { locale: 'tr', slug: 'test-project' });
    const json = await res.json();

    expect(json.data.seo).toBeDefined();
    expect(json.data.seo.hreflang).toBeDefined();
  });

  it('does not expose internal fields', async () => {
    (contentService.getProjectDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockProjectDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/projects/test-project', { locale: 'tr', slug: 'test-project' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('internalUser');
    expect(str).not.toContain('approval');
    expect(str).not.toContain('revision');
  });
});
