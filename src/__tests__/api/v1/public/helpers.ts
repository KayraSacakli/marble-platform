import type { NextRequest } from 'next/server';

export function createMockRequest(url: string, options?: { method?: string; body?: unknown }) {
  const method = options?.method ?? 'GET';
  const init: RequestInit = { method, headers: { 'content-type': 'application/json' } };
  if (options?.body) {
    init.body = JSON.stringify(options.body);
  }
  return new Request(url, init) as NextRequest;
}

export function createRouteContext(params: Record<string, string>) {
  return { params: Promise.resolve(params) };
}

export async function callHandler(
  handler: (req: NextRequest, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>,
  url: string,
  params: Record<string, string>,
  options?: { method?: string; body?: unknown }
): Promise<Response> {
  const req = createMockRequest(url, options);
  const ctx = createRouteContext(params);
  return handler(req, ctx);
}

export const mockMedia = {
  id: 'media-001',
  mediaType: 'image' as const,
  src: '/images/test.jpg',
  width: 800,
  height: 600,
  aspectRatio: '4/3',
  alt: 'Test image',
  loading: 'lazy' as const,
};

export const mockProductSummary = {
  id: 'prod-001',
  name: 'Test Product',
  slug: 'test-product',
  tagline: 'A test product',
  isFeatured: false,
  primaryImage: mockMedia,
};

export const mockCollectionSummary = {
  id: 'coll-001',
  name: 'Test Collection',
  slug: 'test-collection',
  description: 'A test collection',
  coverImage: mockMedia,
};

export const mockApplicationSummary = {
  id: 'app-001',
  name: 'Test Application',
  slug: 'test-application',
  description: 'A test application',
  coverImage: mockMedia,
};

export const mockProjectSummary = {
  id: 'proj-001',
  name: 'Test Project',
  slug: 'test-project',
  description: 'A test project',
  heroImage: mockMedia,
};

export const mockJournalSummary = {
  id: 'journ-001',
  title: 'Test Journal Article',
  slug: 'test-journal-article',
  summary: 'A test article summary',
  coverImage: mockMedia,
  publicationDate: '2026-01-15T00:00:00.000Z',
  author: 'Test Author',
};

export const mockSEO = {
  title: 'Test — Premium Turkish Marble',
  metaDescription: 'Test description',
  canonical: 'https://example.com/tr/products/test',
  robots: 'index' as const,
  hreflang: [
    { lang: 'tr', href: 'https://example.com/tr/products/test' },
    { lang: 'en', href: 'https://example.com/en/products/test' },
    { lang: 'x-default', href: 'https://example.com/tr/products/test' },
  ],
};

export const mockProductDetail = {
  id: 'prod-001',
  name: 'Test Product',
  slug: 'test-product',
  tagline: 'A test product',
  description: 'Test product description',
  primaryImage: mockMedia,
  gallery: [mockMedia],
  collections: [{ id: 'coll-001', name: 'Test Collection', slug: 'test-collection' }],
  applications: [{ id: 'app-001', name: 'Test Application', slug: 'test-application' }],
  projects: [{ id: 'proj-001', name: 'Test Project', slug: 'test-project' }],
  relatedProducts: [mockProductSummary],
  journalArticles: [{ id: 'journ-001', name: 'Test Article', slug: 'test-article' }],
  seo: mockSEO,
  quoteContextIdentifier: 'product:prod-001',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

export const mockCollectionDetail = {
  id: 'coll-001',
  name: 'Test Collection',
  slug: 'test-collection',
  description: 'A test collection',
  coverImage: mockMedia,
  products: [mockProductSummary],
  applications: [{ id: 'app-001', name: 'Test Application', slug: 'test-application' }],
  seo: mockSEO,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

export const mockApplicationDetail = {
  id: 'app-001',
  name: 'Test Application',
  slug: 'test-application',
  description: 'A test application',
  coverImage: mockMedia,
  products: [mockProductSummary],
  projects: [{ id: 'proj-001', name: 'Test Project', slug: 'test-project' }],
  journalArticles: [{ id: 'journ-001', name: 'Test Article', slug: 'test-article' }],
  seo: mockSEO,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

export const mockProjectDetail = {
  id: 'proj-001',
  name: 'Test Project',
  slug: 'test-project',
  description: 'A test project',
  location: 'Istanbul, Turkey',
  projectType: 'HOTEL',
  heroImage: mockMedia,
  gallery: [mockMedia],
  products: [mockProductSummary],
  applications: [{ id: 'app-001', name: 'Test Application', slug: 'test-application' }],
  seo: mockSEO,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

export const mockJournalDetail = {
  id: 'journ-001',
  title: 'Test Journal Article',
  slug: 'test-journal-article',
  summary: 'A test article summary',
  body: 'Full article body content',
  coverImage: mockMedia,
  publicationDate: '2026-01-15T00:00:00.000Z',
  author: 'Test Author',
  relatedProducts: [mockProductSummary],
  relatedApplications: [{ id: 'app-001', name: 'Test Application', slug: 'test-application' }],
  relatedProjects: [{ id: 'proj-001', name: 'Test Project', slug: 'test-project' }],
  relatedArticles: [],
  seo: mockSEO,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-06-01T00:00:00.000Z',
};

export const mockHomepage = {
  hero: {
    heading: 'Premium Turkish Marble',
    subheading: 'Elegance of Nature, Power of Craftsmanship',
    primaryCTA: { label: 'Explore Marbles', href: '/en/products' },
    secondaryCTA: { label: 'Request Quote', href: '/en/quote' },
  },
  sections: [
    { type: 'featured_products', products: [mockProductSummary] },
    { type: 'featured_collections', collections: [mockCollectionSummary] },
    { type: 'final_cta', heading: 'Get a Quote', message: 'Ready to help', primaryCTA: { label: 'Quote', href: '/en/quote' }, secondaryCTA: { label: 'Contact', href: '/en/contact' } },
  ],
  sectionOrder: ['featured_products', 'featured_collections', 'final_cta'],
  seo: mockSEO,
};

export const mockNavigation = {
  primary: [
    { label: 'Marbles', href: '/en/products', visible: true },
    { label: 'Collections', href: '/en/collections', visible: true },
    { label: 'Applications', href: '/en/applications', visible: true },
    { label: 'Projects', href: '/en/projects', visible: true },
    { label: 'Journal', href: '/en/journal', visible: true },
    { label: 'About', href: '/en/about', visible: true },
  ],
  utility: [
    { label: 'TR', href: '/tr', visible: true, type: 'language_switch' as const },
    { label: 'Request Quote', href: '/en/quote', visible: true, type: 'cta' as const },
    { label: 'Contact', href: '/en/contact', visible: true, type: 'link' as const },
  ],
  projectsVisible: true,
};

export const mockFooter = {
  company: [
    { label: 'About', href: '/en/about', visible: true },
    { label: 'Quarry', href: '/en/quarry', visible: true },
    { label: 'Factory', href: '/en/factory', visible: true },
    { label: 'Contact', href: '/en/contact', visible: true },
  ],
  catalogue: [
    { label: 'Marbles', href: '/en/products', visible: true },
    { label: 'Collections', href: '/en/collections', visible: true },
    { label: 'Applications', href: '/en/applications', visible: true },
    { label: 'Projects', href: '/en/projects', visible: true },
    { label: 'Journal', href: '/en/journal', visible: true },
  ],
  conversion: [
    { label: 'Request Quote', href: '/en/quote', visible: true },
  ],
  legal: [],
  language: [
    { label: 'Türkçe', href: '/tr', active: false, available: true },
    { label: 'English', href: '/en', active: true, available: true },
  ],
  copyright: '2026 Premium Turkish Marble. All rights reserved.',
};

export const mockQuoteRequestResponse = {
  id: 'qr-001',
  submittedAt: '2026-09-17T10:00:00.000Z',
};
