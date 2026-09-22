import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/v1/public/[locale]/journal/route';
import { GET as GET_DETAIL } from '@/app/api/v1/public/[locale]/journal/[slug]/route';
import { callHandler, mockJournalSummary, mockJournalDetail } from './helpers';
import { NotFoundError } from '@/lib/api/errors';

vi.mock('@/services/content', () => ({
  contentService: {
    getJournalList: vi.fn(),
    getJournalDetail: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

describe('GET /api/v1/public/[locale]/journal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns journal list with data and meta', async () => {
    (contentService.getJournalList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [mockJournalSummary],
      meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/tr/journal', { locale: 'tr' });
    const json = await res.json();

    expect(json.data.data).toHaveLength(1);
    expect(json.data.data[0].slug).toBe('test-journal-article');
    expect(json.data.data[0].title).toBe('Test Journal Article');
    expect(json.data.data[0].publicationDate).toBeDefined();
  });

  it('returns 200 for EN locale', async () => {
    (contentService.getJournalList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/en/journal', { locale: 'en' });
    expect(res.status).toBe(200);
    expect(contentService.getJournalList).toHaveBeenCalledWith('en');
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET, 'http://localhost/api/v1/public/xx/journal', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });
});

describe('GET /api/v1/public/[locale]/journal/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns journal detail for valid slug', async () => {
    (contentService.getJournalDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockJournalDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/journal/test-journal-article', { locale: 'tr', slug: 'test-journal-article' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slug).toBe('test-journal-article');
    expect(json.data.title).toBe('Test Journal Article');
    expect(json.data.publicationDate).toBeDefined();
    expect(json.data.author).toBeDefined();
    expect(json.data.relatedProducts).toBeDefined();
    expect(json.data.relatedApplications).toBeDefined();
    expect(json.data.relatedProjects).toBeDefined();
    expect(json.data.relatedArticles).toBeDefined();
  });

  it('returns 404 for missing slug', async () => {
    (contentService.getJournalDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/journal/nonexistent', { locale: 'tr', slug: 'nonexistent' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for unpublished content', async () => {
    (contentService.getJournalDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/journal/draft-article', { locale: 'tr', slug: 'draft-article' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for missing translation', async () => {
    (contentService.getJournalDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/en/journal/tr-only-article', { locale: 'en', slug: 'tr-only-article' });
    expect(res.status).toBe(404);
  });

  it('includes SEO data', async () => {
    (contentService.getJournalDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockJournalDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/journal/test-journal-article', { locale: 'tr', slug: 'test-journal-article' });
    const json = await res.json();

    expect(json.data.seo).toBeDefined();
    expect(json.data.seo.hreflang).toBeDefined();
  });

  it('does not expose internal fields', async () => {
    (contentService.getJournalDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockJournalDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/journal/test-journal-article', { locale: 'tr', slug: 'test-journal-article' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('internalUser');
    expect(str).not.toContain('approval');
    expect(str).not.toContain('revision');
    expect(str).not.toContain('auditEvent');
  });
});
