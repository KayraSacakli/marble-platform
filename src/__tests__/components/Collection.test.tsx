// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CollectionCard } from '@/components/collection/CollectionCard';
import { CollectionGrid } from '@/components/collection/CollectionGrid';
import { GET } from '@/app/api/v1/public/[locale]/collections/route';
import { GET as GET_DETAIL } from '@/app/api/v1/public/[locale]/collections/[slug]/route';
import { callHandler, mockCollectionSummary, mockCollectionDetail } from '../api/v1/public/helpers';
import { NotFoundError } from '@/lib/api/errors';

vi.mock('@/services/content', () => ({
  contentService: {
    getCollectionList: vi.fn(),
    getCollectionDetail: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

const mockCollectionSummaryWithImage = {
  ...mockCollectionSummary,
  coverImage: {
    id: 'media-001',
    mediaType: 'image' as const,
    src: '/images/collection.jpg',
    width: 800,
    height: 600,
    aspectRatio: '3/2',
    alt: 'Test collection image',
    loading: 'lazy' as const,
  },
};

const mockCollectionSummaryNoImage = {
  id: 'coll-002',
  name: 'Collection Without Image',
  slug: 'collection-without-image',
  description: 'A collection without image',
};

describe('CollectionCard', () => {
  it('renders collection name', () => {
    render(<CollectionCard collection={mockCollectionSummary} />);
    expect(screen.getByRole('heading', { name: 'Test Collection' })).toBeInTheDocument();
  });

  it('renders collection description', () => {
    render(<CollectionCard collection={mockCollectionSummary} />);
    expect(screen.getByText('A test collection')).toBeInTheDocument();
  });

  it('renders image when available', () => {
    render(<CollectionCard collection={mockCollectionSummaryWithImage} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/images/collection.jpg');
    expect(img).toHaveAttribute('alt', 'Test collection image');
  });

  it('renders fallback when no image', () => {
    render(<CollectionCard collection={mockCollectionSummaryNoImage} />);
    expect(screen.getAllByText('Collection Without Image').length).toBeGreaterThanOrEqual(1);
  });

  it('links to collection detail', () => {
    render(<CollectionCard collection={mockCollectionSummary} />);
    const link = screen.getByRole('link', { name: 'Test Collection' });
    expect(link).toHaveAttribute('href', '/collections/test-collection');
  });

  it('has accessible name', () => {
    render(<CollectionCard collection={mockCollectionSummary} />);
    const link = screen.getByRole('link', { name: 'Test Collection' });
    expect(link).toBeInTheDocument();
  });

  it('loads image eagerly when priority', () => {
    render(<CollectionCard collection={mockCollectionSummaryWithImage} priority />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('loads image lazily when not priority', () => {
    render(<CollectionCard collection={mockCollectionSummaryWithImage} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});

describe('CollectionGrid', () => {
  it('renders collection cards', () => {
    render(<CollectionGrid collections={[mockCollectionSummary, mockCollectionSummaryNoImage]} />);
    expect(screen.getByRole('heading', { name: 'Test Collection' })).toBeInTheDocument();
    expect(screen.getAllByText('Collection Without Image').length).toBeGreaterThanOrEqual(1);
  });

  it('renders correct number of cards', () => {
    render(<CollectionGrid collections={[mockCollectionSummary, mockCollectionSummaryNoImage]} />);
    const links = screen.getAllByRole('link', { name: /test collection|collection without/i });
    expect(links.length).toBe(2);
  });

  it('returns null for empty array', () => {
    const { container } = render(<CollectionGrid collections={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('marks first 3 items as priority', () => {
    const collections = [
      { ...mockCollectionSummary, id: '1', name: 'Collection 1' },
      { ...mockCollectionSummary, id: '2', name: 'Collection 2' },
      { ...mockCollectionSummary, id: '3', name: 'Collection 3' },
      { ...mockCollectionSummary, id: '4', name: 'Collection 4' },
    ];
    render(<CollectionGrid collections={collections} />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('loading', 'eager');
    expect(images[1]).toHaveAttribute('loading', 'eager');
    expect(images[2]).toHaveAttribute('loading', 'eager');
    expect(images[3]).toHaveAttribute('loading', 'lazy');
  });
});

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
  });

  it('returns 200 for EN locale', async () => {
    (contentService.getCollectionList as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 },
    });

    const res = await callHandler(GET, 'http://localhost/api/v1/public/en/collections', { locale: 'en' });
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

  it('returns collection detail', async () => {
    (contentService.getCollectionDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockCollectionDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/collections/test-collection', { locale: 'tr', slug: 'test-collection' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slug).toBe('test-collection');
  });

  it('returns 404 for missing slug', async () => {
    (contentService.getCollectionDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/collections/nonexistent', { locale: 'tr', slug: 'nonexistent' });
    expect(res.status).toBe(404);
  });
});
