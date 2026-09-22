import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as GET_ABOUT } from '@/app/api/v1/public/[locale]/company/about/route';
import { GET as GET_QUARRY } from '@/app/api/v1/public/[locale]/company/quarry/route';
import { GET as GET_FACTORY } from '@/app/api/v1/public/[locale]/company/factory/route';
import { callHandler } from './helpers';
import { NotFoundError } from '@/lib/api/errors';

vi.mock('@/services/content', () => ({
  contentService: {
    getCompanyContent: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

const mockCompanyContent = {
  id: 'company-001',
  name: 'About Us',
  slug: 'about-us',
  description: 'Company description',
  coverImage: {
    id: 'media-001',
    mediaType: 'image',
    src: '/images/about.jpg',
    width: 800,
    height: 600,
    aspectRatio: '4/3',
    alt: 'About image',
    loading: 'lazy',
  },
};

describe('GET /api/v1/public/[locale]/company/about', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns about content', async () => {
    (contentService.getCompanyContent as ReturnType<typeof vi.fn>).mockResolvedValue(mockCompanyContent);

    const res = await callHandler(GET_ABOUT, 'http://localhost/api/v1/public/tr/company/about', { locale: 'tr' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.data.slug).toBe('about-us');
    expect(contentService.getCompanyContent).toHaveBeenCalledWith('ABOUT', 'tr');
  });

  it('returns 404 when about content does not exist', async () => {
    (contentService.getCompanyContent as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_ABOUT, 'http://localhost/api/v1/public/tr/company/about', { locale: 'tr' });
    expect(res.status).toBe(404);
  });

  it('returns 404 for EN when only TR exists', async () => {
    (contentService.getCompanyContent as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_ABOUT, 'http://localhost/api/v1/public/en/company/about', { locale: 'en' });
    expect(res.status).toBe(404);
  });

  it('does not expose internal fields', async () => {
    (contentService.getCompanyContent as ReturnType<typeof vi.fn>).mockResolvedValue(mockCompanyContent);

    const res = await callHandler(GET_ABOUT, 'http://localhost/api/v1/public/tr/company/about', { locale: 'tr' });
    const str = JSON.stringify(await res.json());

    expect(str).not.toContain('internalUser');
    expect(str).not.toContain('approval');
    expect(str).not.toContain('revision');
  });
});

describe('GET /api/v1/public/[locale]/company/quarry', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns quarry content', async () => {
    (contentService.getCompanyContent as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockCompanyContent,
      name: 'Our Quarry',
      slug: 'quarry',
    });

    const res = await callHandler(GET_QUARRY, 'http://localhost/api/v1/public/tr/company/quarry', { locale: 'tr' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slug).toBe('quarry');
    expect(contentService.getCompanyContent).toHaveBeenCalledWith('QUARRY', 'tr');
  });

  it('returns 404 when quarry content does not exist', async () => {
    (contentService.getCompanyContent as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_QUARRY, 'http://localhost/api/v1/public/tr/company/quarry', { locale: 'tr' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET_QUARRY, 'http://localhost/api/v1/public/xx/company/quarry', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });
});

describe('GET /api/v1/public/[locale]/company/factory', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('returns factory content', async () => {
    (contentService.getCompanyContent as ReturnType<typeof vi.fn>).mockResolvedValue({
      ...mockCompanyContent,
      name: 'Our Factory',
      slug: 'factory',
    });

    const res = await callHandler(GET_FACTORY, 'http://localhost/api/v1/public/tr/company/factory', { locale: 'tr' });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.slug).toBe('factory');
    expect(contentService.getCompanyContent).toHaveBeenCalledWith('FACTORY', 'tr');
  });

  it('returns 404 when factory content does not exist', async () => {
    (contentService.getCompanyContent as ReturnType<typeof vi.fn>).mockRejectedValue(new NotFoundError());

    const res = await callHandler(GET_FACTORY, 'http://localhost/api/v1/public/tr/company/factory', { locale: 'tr' });
    expect(res.status).toBe(404);
  });

  it('returns 400 for invalid locale', async () => {
    const res = await callHandler(GET_FACTORY, 'http://localhost/api/v1/public/xx/company/factory', { locale: 'xx' });
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.error.code).toBe('BAD_REQUEST');
  });
});
