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
    listProducts: vi.fn(),
    listCollections: vi.fn(),
    listApplications: vi.fn(),
    listProjects: vi.fn(),
    listJournalArticles: vi.fn(),
  },
}));

const findPublishedBySlug = vi.mocked(contentRepository.findPublishedBySlug);
const findByContentItemId = vi.mocked(contentRepository.findByContentItemId);
const getProductCollections = vi.mocked(contentRepository.getProductCollections);
const getProductApplications = vi.mocked(contentRepository.getProductApplications);
const getRelatedProducts = vi.mocked(contentRepository.getRelatedProducts);
const getJournalArticlesForProduct = vi.mocked(contentRepository.getJournalArticlesForProduct);
const getProductProjects = vi.mocked(contentRepository.getProductProjects);
const listProducts = vi.mocked(contentRepository.listProducts);
const listCollections = vi.mocked(contentRepository.listCollections);
const listApplications = vi.mocked(contentRepository.listApplications);
const listProjects = vi.mocked(contentRepository.listProjects);
const listJournalArticles = vi.mocked(contentRepository.listJournalArticles);

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

/**
 * List summaries must carry media from the variant ROW (mediaPresentations
 * include). The row also carries contentItem.variants without media, which
 * previously produced summaries with no primaryImage/coverImage/heroImage.
 */
describe('public list summaries expose media from the variant row', () => {
  const primaryMedia = {
    role: 'PRIMARY',
    altText: 'Alexander Black slab',
    caption: null,
    focalPointX: null,
    focalPointY: null,
    mediaAsset: {
      id: 'asset-001',
      mediaType: 'IMAGE',
      sourceReference: '/api/media/asset-001.jpg',
      width: 1600,
      height: 1200,
      aspectRatio: '4/3',
      fileType: 'image/jpeg',
    },
  };

  function listRow(overrides?: { aggregateState?: string; media?: unknown[] }) {
    const aggregateState = overrides?.aggregateState ?? 'ACTIVE';
    const media = overrides?.media ?? [primaryMedia];
    return {
      id: 'v-en',
      contentItemId: 'ci-list',
      locale: 'en',
      lifecycleState: 'PUBLISHED',
      name: 'Alexander Black',
      slug: 'alexander-black',
      description: 'Dark marble',
      tagline: 'Bold black marble',
      isFeatured: false,
      createdAt: NOW,
      updatedAt: NOW,
      mediaPresentations: media,
      contentItem: {
        type: 'PRODUCT',
        aggregateState,
        // scalar-only include: no mediaPresentations on the nested variants
        variants: [
          {
            id: 'v-en',
            locale: 'en',
            lifecycleState: 'PUBLISHED',
            name: 'Alexander Black',
            slug: 'alexander-black',
          },
        ],
        journalArticle: null,
      },
    } as never;
  }

  const listMeta = { page: 1, pageSize: 24, total: 1, totalPages: 1 };

  beforeEach(() => {
    vi.resetAllMocks();
    listProducts.mockResolvedValue({ items: [listRow()], meta: listMeta } as never);
    listCollections.mockResolvedValue({ items: [listRow()], meta: listMeta } as never);
    listApplications.mockResolvedValue({ items: [listRow()], meta: listMeta } as never);
    listProjects.mockResolvedValue({ items: [listRow()], meta: listMeta } as never);
    listJournalArticles.mockResolvedValue({ items: [listRow()], meta: listMeta } as never);
  });

  it('returns primaryImage on the product list', async () => {
    const result = await contentService.getProductList('en');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].primaryImage).toBeDefined();
    expect(result.data[0].primaryImage?.src).toBe('/api/media/asset-001.jpg');
    expect(result.data[0].primaryImage?.alt).toBe('Alexander Black slab');
  });

  it('returns coverImage on collection and application lists', async () => {
    const collections = await contentService.getCollectionList('en');
    expect(collections.data[0].coverImage?.src).toBe('/api/media/asset-001.jpg');

    const applications = await contentService.getApplicationList('en');
    expect(applications.data[0].coverImage?.src).toBe('/api/media/asset-001.jpg');
  });

  it('returns heroImage on the project list', async () => {
    const projects = await contentService.getProjectList('en');
    expect(projects.data[0].heroImage?.src).toBe('/api/media/asset-001.jpg');
  });

  it('returns coverImage on the journal list', async () => {
    const journal = await contentService.getJournalList('en');
    expect(journal.data[0].coverImage?.src).toBe('/api/media/asset-001.jpg');
  });

  it('still drops items whose aggregate is not ACTIVE', async () => {
    listProducts.mockResolvedValue({
      items: [listRow({ aggregateState: 'ARCHIVED' })],
      meta: listMeta,
    } as never);
    const result = await contentService.getProductList('en');
    expect(result.data).toEqual([]);
  });

  it('returns no image when the row has no media', async () => {
    listProducts.mockResolvedValue({
      items: [listRow({ media: [] })],
      meta: listMeta,
    } as never);
    const result = await contentService.getProductList('en');
    expect(result.data).toHaveLength(1);
    expect(result.data[0].primaryImage).toBeUndefined();
  });
});
