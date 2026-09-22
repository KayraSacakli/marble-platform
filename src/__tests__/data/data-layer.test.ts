import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getProducts, getProduct } from '@/lib/data/products';
import { getCollections, getCollection } from '@/lib/data/collections';
import { getApplications, getApplication } from '@/lib/data/applications';
import { getProjects, getProject } from '@/lib/data/projects';
import { getJournal, getJournalArticle } from '@/lib/data/journal';
import { getAbout, getQuarry, getFactory } from '@/lib/data/company';
import { getNavigation } from '@/lib/data/navigation';
import { getFooter } from '@/lib/data/footer';
import { getHomepage } from '@/lib/data/homepage';
import { apiClient } from '@/lib/api/client';

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    getList: vi.fn(),
    getOne: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedClient = vi.mocked(apiClient);

describe('Data Layer — Products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProducts', () => {
    it('calls correct endpoint with locale', async () => {
      const mockResponse = {
        data: [{ id: '1', name: 'Beyaz Mermer', slug: 'beyaz-mermer' }],
        meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
      };
      mockedClient.getList.mockResolvedValue(mockResponse);

      const result = await getProducts('tr');

      expect(mockedClient.getList).toHaveBeenCalledWith('tr', '/products', undefined);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('passes pagination params', async () => {
      mockedClient.getList.mockResolvedValue({ data: [], meta: { page: 2, pageSize: 12, total: 0, totalPages: 0 } });

      await getProducts('en', { page: 2, pageSize: 12 });

      expect(mockedClient.getList).toHaveBeenCalledWith('en', '/products', { page: 2, pageSize: 12 });
    });
  });

  describe('getProduct', () => {
    it('calls correct endpoint with locale and slug', async () => {
      const mockProduct = {
        data: { id: '1', name: 'Beyaz Mermer', slug: 'beyaz-mermer', description: 'Test' },
      };
      mockedClient.getOne.mockResolvedValue(mockProduct);

      const result = await getProduct('tr', 'beyaz-mermer');

      expect(mockedClient.getOne).toHaveBeenCalledWith('tr', '/products/beyaz-mermer');
      expect(result.name).toBe('Beyaz Mermer');
    });
  });
});

describe('Data Layer — Homepage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getHomepage', () => {
    it('calls correct endpoint with locale', async () => {
      const mockHomepage = {
        data: {
          hero: { heading: 'Test Hero', primaryCTA: { label: 'Explore', href: '/tr/products' } },
          sections: [],
          sectionOrder: [],
          seo: { title: 'Test', metaDescription: 'Test', canonical: '/', robots: 'index' as const, hreflang: [] },
        },
      };
      mockedClient.getOne.mockResolvedValue(mockHomepage);

      const result = await getHomepage('tr');

      expect(mockedClient.getOne).toHaveBeenCalledWith('tr', '/homepage');
      expect(result.hero.heading).toBe('Test Hero');
    });
  });
});

describe('Data Layer — Collections', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getCollections calls correct endpoint', async () => {
    mockedClient.getList.mockResolvedValue({ data: [], meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 } });
    await getCollections('en');
    expect(mockedClient.getList).toHaveBeenCalledWith('en', '/collections', undefined);
  });

  it('getCollection calls correct endpoint with slug', async () => {
    mockedClient.getOne.mockResolvedValue({ data: { id: '1', name: 'Test', slug: 'test' } });
    const result = await getCollection('tr', 'test-slug');
    expect(mockedClient.getOne).toHaveBeenCalledWith('tr', '/collections/test-slug');
    expect(result.name).toBe('Test');
  });
});

describe('Data Layer — Applications', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getApplications calls correct endpoint', async () => {
    mockedClient.getList.mockResolvedValue({ data: [], meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 } });
    await getApplications('tr');
    expect(mockedClient.getList).toHaveBeenCalledWith('tr', '/applications', undefined);
  });

  it('getApplication calls correct endpoint with slug', async () => {
    mockedClient.getOne.mockResolvedValue({ data: { id: '1', name: 'Floor', slug: 'floor' } });
    await getApplication('en', 'floor');
    expect(mockedClient.getOne).toHaveBeenCalledWith('en', '/applications/floor');
  });
});

describe('Data Layer — Projects', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getProjects calls correct endpoint', async () => {
    mockedClient.getList.mockResolvedValue({ data: [], meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 } });
    await getProjects('tr');
    expect(mockedClient.getList).toHaveBeenCalledWith('tr', '/projects', undefined);
  });

  it('getProject calls correct endpoint with slug', async () => {
    mockedClient.getOne.mockResolvedValue({ data: { id: '1', name: 'Hotel', slug: 'hotel' } });
    await getProject('en', 'hotel');
    expect(mockedClient.getOne).toHaveBeenCalledWith('en', '/projects/hotel');
  });
});

describe('Data Layer — Journal', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getJournal calls correct endpoint', async () => {
    mockedClient.getList.mockResolvedValue({ data: [], meta: { page: 1, pageSize: 24, total: 0, totalPages: 0 } });
    await getJournal('tr');
    expect(mockedClient.getList).toHaveBeenCalledWith('tr', '/journal', undefined);
  });

  it('getJournalArticle calls correct endpoint with slug', async () => {
    mockedClient.getOne.mockResolvedValue({ data: { id: '1', title: 'Article', slug: 'article' } });
    await getJournalArticle('en', 'article');
    expect(mockedClient.getOne).toHaveBeenCalledWith('en', '/journal/article');
  });
});

describe('Data Layer — Company', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getAbout calls correct endpoint', async () => {
    mockedClient.getOne.mockResolvedValue({ data: { id: '1', name: 'About', slug: 'about' } });
    await getAbout('tr');
    expect(mockedClient.getOne).toHaveBeenCalledWith('tr', '/company/about');
  });

  it('getQuarry calls correct endpoint', async () => {
    mockedClient.getOne.mockResolvedValue({ data: { id: '1', name: 'Quarry', slug: 'quarry' } });
    await getQuarry('en');
    expect(mockedClient.getOne).toHaveBeenCalledWith('en', '/company/quarry');
  });

  it('getFactory calls correct endpoint', async () => {
    mockedClient.getOne.mockResolvedValue({ data: { id: '1', name: 'Factory', slug: 'factory' } });
    await getFactory('tr');
    expect(mockedClient.getOne).toHaveBeenCalledWith('tr', '/company/factory');
  });
});

describe('Data Layer — Navigation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getNavigation calls correct endpoint', async () => {
    const mockNav = {
      data: { primary: [], utility: [], projectsVisible: false },
    };
    mockedClient.getOne.mockResolvedValue(mockNav);
    const result = await getNavigation('en');
    expect(mockedClient.getOne).toHaveBeenCalledWith('en', '/navigation');
    expect(result.projectsVisible).toBe(false);
  });
});

describe('Data Layer — Footer', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('getFooter calls correct endpoint', async () => {
    const mockFooter = {
      data: { company: [], catalogue: [], conversion: [], legal: [], language: [], copyright: '2026' },
    };
    mockedClient.getOne.mockResolvedValue(mockFooter);
    const result = await getFooter('tr');
    expect(mockedClient.getOne).toHaveBeenCalledWith('tr', '/footer');
    expect(result.copyright).toBe('2026');
  });
});

describe('Data Layer — Error Propagation', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('propagates API client errors', async () => {
    const { ApiClientError } = await import('@/lib/api/client-errors');
    mockedClient.getOne.mockRejectedValue(new ApiClientError('Not found', 404, 'NOT_FOUND'));

    await expect(getProduct('tr', 'nonexistent')).rejects.toThrow('Not found');
  });
});
