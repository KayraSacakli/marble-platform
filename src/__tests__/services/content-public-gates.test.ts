import { describe, it, expect, vi, beforeEach } from 'vitest';
import { contentService } from '@/services/content';
import { contentRepository } from '@/repositories/content';
import { NotFoundError } from '@/lib/api/errors';

vi.mock('@/repositories/content', () => ({
  contentRepository: {
    findPublishedBySlug: vi.fn(),
    findByContentItemId: vi.fn(),
    getProductCollections: vi.fn(),
    getProductApplications: vi.fn(),
    getRelatedProducts: vi.fn(),
    getJournalArticlesForProduct: vi.fn(),
    getProductProjects: vi.fn(),
  },
}));

const findPublishedBySlug = vi.mocked(contentRepository.findPublishedBySlug);
const findByContentItemId = vi.mocked(contentRepository.findByContentItemId);
const getProductCollections = vi.mocked(contentRepository.getProductCollections);
const getProductApplications = vi.mocked(contentRepository.getProductApplications);
const getRelatedProducts = vi.mocked(contentRepository.getRelatedProducts);
const getJournalArticlesForProduct = vi.mocked(contentRepository.getJournalArticlesForProduct);
const getProductProjects = vi.mocked(contentRepository.getProductProjects);

const NOW = new Date('2026-01-01T00:00:00.000Z');

function detailVariant(aggregateState: string) {
  return {
    id: 'v-en',
    contentItemId: 'ci-product',
    slug: 'carrara-marble',
    locale: 'en',
    lifecycleState: 'PUBLISHED',
    name: 'Carrara Marble',
    description: 'Italian marble',
    tagline: null,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    seoRobots: null,
    mediaPresentations: [],
    createdAt: NOW,
    updatedAt: NOW,
    contentItem: {
      type: 'PRODUCT',
      aggregateState,
      variants: [
        {
          id: 'v-en',
          locale: 'en',
          lifecycleState: 'PUBLISHED',
          name: 'Carrara Marble',
          slug: 'carrara-marble',
        },
      ],
    },
  } as never;
}

function relationRow(contentItemId: string, aggregateState: string, slug: string) {
  return {
    contentItemId,
    slug,
    contentItem: {
      aggregateState,
      variants: [
        { id: `v-${contentItemId}`, locale: 'en', lifecycleState: 'PUBLISHED', name: slug, slug },
      ],
    },
  } as never;
}

/**
 * Relation reads (collections, applications, projects, related products,
 * journal references) come from junction queries that do not carry the
 * aggregate filter; findPublishedVariant is the single chokepoint that must
 * enforce ACTIVE + PUBLISHED for them.
 */
describe('public detail relations enforce the ACTIVE gate', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    findByContentItemId.mockResolvedValue(null);
    getProductCollections.mockResolvedValue([]);
    getProductApplications.mockResolvedValue([]);
    getRelatedProducts.mockResolvedValue([]);
    getJournalArticlesForProduct.mockResolvedValue([]);
    getProductProjects.mockResolvedValue([]);
  });

  it('drops ARCHIVED relations and keeps ACTIVE ones', async () => {
    findPublishedBySlug.mockResolvedValue(detailVariant('ACTIVE'));
    getProductCollections.mockResolvedValue([
      relationRow('ci-c-archived', 'ARCHIVED', 'archived-collection'),
    ]);
    getProductApplications.mockResolvedValue([
      relationRow('ci-app-active', 'ACTIVE', 'bathroom-app'),
    ]);
    getRelatedProducts.mockResolvedValue([
      relationRow('ci-p-active', 'ACTIVE', 'active-related'),
      relationRow('ci-p-removed', 'REMOVED', 'removed-related'),
    ]);

    const detail = await contentService.getProductDetail('carrara-marble', 'en');

    expect(detail.collections).toEqual([]);
    expect(detail.applications.map((a) => a.id)).toEqual(['ci-app-active']);
    // summaries are built from the variant row, so the id is the variant id
    expect(detail.relatedProducts.map((p) => p.id)).toEqual(['v-ci-p-active']);
    expect(detail.journalArticles).toEqual([]);
    expect(detail.projects).toEqual([]);
  });

  it('hides a detail page whose aggregate is not ACTIVE', async () => {
    findPublishedBySlug.mockResolvedValue(detailVariant('ARCHIVED'));
    await expect(contentService.getProductDetail('carrara-marble', 'en')).rejects.toThrow(
      NotFoundError,
    );
  });

  it('shows the detail page when the aggregate is ACTIVE', async () => {
    findPublishedBySlug.mockResolvedValue(detailVariant('ACTIVE'));
    const detail = await contentService.getProductDetail('carrara-marble', 'en');
    expect(detail.name).toBe('Carrara Marble');
    expect(detail.collections).toEqual([]);
    expect(detail.applications).toEqual([]);
    expect(detail.relatedProducts).toEqual([]);
  });
});
