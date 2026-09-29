import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contentRepository } from '@/repositories/content';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contentVariant: {
      count: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const count = vi.mocked(prisma.contentVariant.count);
const findFirst = vi.mocked(prisma.contentVariant.findFirst);
const findMany = vi.mocked(prisma.contentVariant.findMany);

/**
 * Regression suite for the public publication gate.
 *
 * Several queries used `{ ...publishedClause(locale), contentItem: { type } }`,
 * where the second `contentItem` key silently REPLACED the one carrying the
 * `aggregateState: 'ACTIVE'` gate — exposing non-ACTIVE aggregates publicly.
 * These tests assert the gate survives in the exact `where` sent to Prisma.
 */
describe('public repository publication gates (PUBLISHED + ACTIVE)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    count.mockResolvedValue(0);
    findFirst.mockResolvedValue(null as never);
    findMany.mockResolvedValue([] as never);
  });

  it('countPublished keeps the ACTIVE gate alongside the content type', async () => {
    await contentRepository.countPublished('PRODUCT', 'en');
    expect(count).toHaveBeenCalledTimes(1);
    expect(count.mock.calls[0][0]?.where).toEqual({
      contentItem: { aggregateState: 'ACTIVE', type: 'PRODUCT' },
      locale: 'en',
      lifecycleState: 'PUBLISHED',
    });
  });

  it('findCompanyContent keeps the ACTIVE gate alongside the type filter', async () => {
    await contentRepository.findCompanyContent('QUARRY', 'tr');
    expect(findFirst).toHaveBeenCalledTimes(1);
    expect(findFirst.mock.calls[0][0]?.where).toEqual({
      contentItem: {
        aggregateState: 'ACTIVE',
        type: 'COMPANY_CONTENT',
        companyContent: { kind: 'QUARRY' },
      },
      locale: 'tr',
      lifecycleState: 'PUBLISHED',
    });
  });

  it.each([
    ['getFeaturedProducts', 'PRODUCT'],
    ['getFeaturedCollections', 'COLLECTION'],
    ['getFeaturedApplications', 'APPLICATION'],
    ['getFeaturedProjects', 'PROJECT'],
    ['getFeaturedJournal', 'JOURNAL_ARTICLE'],
  ] as const)('%s keeps the ACTIVE gate', async (method, type) => {
    await contentRepository[method]('en');
    expect(findMany).toHaveBeenCalledTimes(1);
    const where = findMany.mock.calls[0][0]?.where as Record<string, unknown>;
    expect(where.contentItem).toEqual({ aggregateState: 'ACTIVE', type });
    expect(where.locale).toBe('en');
    expect(where.lifecycleState).toBe('PUBLISHED');
  });

  it('listProducts/listPublished keeps the ACTIVE gate', async () => {
    await contentRepository.listProducts('en', { page: 1, pageSize: 10 });
    expect(findMany).toHaveBeenCalledTimes(1);
    const where = findMany.mock.calls[0][0]?.where as Record<string, unknown>;
    expect(where.contentItem).toEqual({ aggregateState: 'ACTIVE', type: 'PRODUCT' });
    expect(where.lifecycleState).toBe('PUBLISHED');
    expect(count.mock.calls[0][0]?.where).toEqual(where);
  });
});
