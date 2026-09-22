// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ApplicationCard } from '@/components/application/ApplicationCard';
import { ApplicationGrid } from '@/components/application/ApplicationGrid';
import { GET } from '@/app/api/v1/public/[locale]/applications/route';
import { GET as GET_DETAIL } from '@/app/api/v1/public/[locale]/applications/[slug]/route';
import { callHandler, mockApplicationSummary, mockApplicationDetail } from '../api/v1/public/helpers';
import { NotFoundError } from '@/lib/api/errors';

vi.mock('@/services/content', () => ({
  contentService: {
    getApplicationList: vi.fn(),
    getApplicationDetail: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

const mockApplicationSummaryWithImage = {
  ...mockApplicationSummary,
  coverImage: {
    id: 'media-001',
    mediaType: 'image' as const,
    src: '/images/application.jpg',
    width: 800,
    height: 500,
    aspectRatio: '16/10',
    alt: 'Test application image',
    loading: 'lazy' as const,
  },
};

const mockApplicationSummaryNoImage = {
  id: 'app-002',
  name: 'Application Without Image',
  slug: 'application-without-image',
  description: 'An application without image',
};

describe('ApplicationCard', () => {
  it('renders application name', () => {
    render(<ApplicationCard application={mockApplicationSummary} />);
    expect(screen.getByRole('heading', { name: 'Test Application' })).toBeInTheDocument();
  });

  it('renders application description', () => {
    render(<ApplicationCard application={mockApplicationSummary} />);
    expect(screen.getByText('A test application')).toBeInTheDocument();
  });

  it('renders image when available', () => {
    render(<ApplicationCard application={mockApplicationSummaryWithImage} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('src', '/images/application.jpg');
    expect(img).toHaveAttribute('alt', 'Test application image');
  });

  it('renders fallback when no image', () => {
    render(<ApplicationCard application={mockApplicationSummaryNoImage} />);
    expect(screen.getAllByText('Application Without Image').length).toBeGreaterThanOrEqual(1);
  });

  it('links to application detail', () => {
    render(<ApplicationCard application={mockApplicationSummary} />);
    const link = screen.getByRole('link', { name: 'Test Application' });
    expect(link).toHaveAttribute('href', '/applications/test-application');
  });

  it('has accessible name', () => {
    render(<ApplicationCard application={mockApplicationSummary} />);
    const link = screen.getByRole('link', { name: 'Test Application' });
    expect(link).toBeInTheDocument();
  });

  it('loads image eagerly when priority', () => {
    render(<ApplicationCard application={mockApplicationSummaryWithImage} priority />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'eager');
  });

  it('loads image lazily when not priority', () => {
    render(<ApplicationCard application={mockApplicationSummaryWithImage} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});

describe('ApplicationGrid', () => {
  it('renders application cards', () => {
    render(<ApplicationGrid applications={[mockApplicationSummary, mockApplicationSummaryNoImage]} />);
    expect(screen.getByRole('heading', { name: 'Test Application' })).toBeInTheDocument();
    expect(screen.getAllByText('Application Without Image').length).toBeGreaterThanOrEqual(1);
  });

  it('renders correct number of cards', () => {
    render(<ApplicationGrid applications={[mockApplicationSummary, mockApplicationSummaryNoImage]} />);
    const links = screen.getAllByRole('link', { name: /test application|application without/i });
    expect(links.length).toBe(2);
  });

  it('returns null for empty array', () => {
    const { container } = render(<ApplicationGrid applications={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('marks first 3 items as priority', () => {
    const applications = [
      { ...mockApplicationSummary, id: '1', name: 'Application 1' },
      { ...mockApplicationSummary, id: '2', name: 'Application 2' },
      { ...mockApplicationSummary, id: '3', name: 'Application 3' },
      { ...mockApplicationSummary, id: '4', name: 'Application 4' },
    ];
    render(<ApplicationGrid applications={applications} />);
    const images = screen.getAllByRole('img');
    expect(images[0]).toHaveAttribute('loading', 'eager');
    expect(images[1]).toHaveAttribute('loading', 'eager');
    expect(images[2]).toHaveAttribute('loading', 'eager');
    expect(images[3]).toHaveAttribute('loading', 'lazy');
  });
});

describe('GET /api/v1/public/[locale]/applications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns application list with data', async () => {
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

  it('returns application detail', async () => {
    (contentService.getApplicationDetail as ReturnType<typeof vi.fn>).mockResolvedValue(mockApplicationDetail);

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/applications/test-application', { locale: 'tr', slug: 'test-application' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slug).toBe('test-application');
  });

  it('returns 404 for missing slug', async () => {
    (contentService.getApplicationDetail as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_DETAIL, 'http://localhost/api/v1/public/tr/applications/nonexistent', { locale: 'tr', slug: 'nonexistent' });
    expect(res.status).toBe(404);
  });
});
