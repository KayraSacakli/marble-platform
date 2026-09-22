// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { HomepageContent } from '@/types/api';
import { FeaturedProductsSection } from '@/components/home/FeaturedProductsSection';
import { CollectionsSection } from '@/components/home/CollectionsSection';
import { ApplicationsSection } from '@/components/home/ApplicationsSection';
import { ProjectsSection } from '@/components/home/ProjectsSection';
import { JournalSection } from '@/components/home/JournalSection';
import { HomepageCTA } from '@/components/home/HomepageCTA';
import { HeroContent } from '@/components/home/Hero/HeroContent';
import { HeroFallback } from '@/components/home/Hero/HeroFallback';

vi.mock('next/navigation', () => ({
  usePathname: () => '/tr',
}));

function makeHomepageContent(overrides?: Partial<HomepageContent>): HomepageContent {
  return {
    hero: {
      heading: 'Premium Natural Stone',
      subheading: 'Architectural marble solutions',
      primaryCTA: { label: 'Explore', href: '/products' },
      secondaryCTA: { label: 'Quote', href: '/quote' },
      ...overrides?.hero,
    },
    sections: overrides?.sections ?? [],
    sectionOrder: overrides?.sectionOrder ?? [],
    seo: {
      title: 'Homepage',
      metaDescription: 'Test',
      canonical: 'https://example.com',
      robots: 'index',
      hreflang: [],
      ...overrides?.seo,
    },
  };
}

// ============================================================
// Homepage Data
// ============================================================

describe('Homepage — Data Handling', () => {
  it('renders hero heading from data', () => {
    const data = makeHomepageContent();
    render(<HeroContent hero={data.hero} />);
    expect(screen.getByText('Premium Natural Stone')).toBeDefined();
  });

  it('renders hero subheading from data', () => {
    const data = makeHomepageContent();
    render(<HeroContent hero={data.hero} />);
    expect(screen.getByText('Architectural marble solutions')).toBeDefined();
  });

  it('renders primary CTA from data', () => {
    const data = makeHomepageContent();
    render(<HeroContent hero={data.hero} />);
    expect(screen.getByText('Explore')).toBeDefined();
  });

  it('renders secondary CTA from data', () => {
    const data = makeHomepageContent();
    render(<HeroContent hero={data.hero} />);
    expect(screen.getByText('Quote')).toBeDefined();
  });
});

// ============================================================
// Hero Fallback
// ============================================================

describe('Hero — Fallback', () => {
  it('renders fallback heading', () => {
    const hero = {
      heading: 'Stone Heritage',
      primaryCTA: { label: 'Explore', href: '/products' },
      secondaryCTA: { label: 'Quote', href: '/quote' },
    };
    render(<HeroFallback hero={hero} />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Stone Heritage');
  });

  it('renders fallback subheading', () => {
    const hero = {
      heading: 'Stone Heritage',
      subheading: 'Since 1990',
      primaryCTA: { label: 'Explore', href: '/products' },
      secondaryCTA: { label: 'Quote', href: '/quote' },
    };
    render(<HeroFallback hero={hero} />);
    expect(screen.getByText('Since 1990')).toBeDefined();
  });

  it('renders CTA links', () => {
    const hero = {
      heading: 'Stone Heritage',
      primaryCTA: { label: 'Explore', href: '/products' },
      secondaryCTA: { label: 'Quote', href: '/quote' },
    };
    render(<HeroFallback hero={hero} />);
    expect(screen.getByText('Explore').getAttribute('href')).toBe('/products');
    expect(screen.getByText('Quote').getAttribute('href')).toBe('/quote');
  });

  it('omits subheading when not provided', () => {
    const hero = {
      heading: 'Stone Heritage',
      primaryCTA: { label: 'Explore', href: '/products' },
      secondaryCTA: { label: 'Quote', href: '/quote' },
    };
    const { container } = render(<HeroFallback hero={hero} />);
    expect(container.querySelector('.hero__fallback-sub')).toBeNull();
  });
});

// ============================================================
// Hero Content
// ============================================================

describe('Hero — Content', () => {
  it('renders h1 heading', () => {
    const hero = {
      heading: 'Test Heading',
      primaryCTA: { label: 'Go', href: '/go' },
      secondaryCTA: { label: 'Back', href: '/back' },
    };
    render(<HeroContent hero={hero} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveTextContent('Test Heading');
  });

  it('renders CTA links with correct hrefs', () => {
    const hero = {
      heading: 'Test',
      primaryCTA: { label: 'Primary', href: '/primary' },
      secondaryCTA: { label: 'Secondary', href: '/secondary' },
    };
    render(<HeroContent hero={hero} />);
    expect(screen.getByText('Primary').getAttribute('href')).toBe('/primary');
    expect(screen.getByText('Secondary').getAttribute('href')).toBe('/secondary');
  });
});

// ============================================================
// Featured Products Section
// ============================================================

describe('Homepage — Featured Products Section', () => {
  const products = [
    { id: '1', name: 'Calacatta Gold', slug: 'calacatta-gold', isFeatured: true },
    { id: '2', name: 'Statuario', slug: 'statuario', isFeatured: true },
  ];

  it('renders section heading', () => {
    render(<FeaturedProductsSection products={products} heading="Our Products" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Our Products');
  });

  it('uses default heading when none provided', () => {
    render(<FeaturedProductsSection products={products} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Featured Products');
  });

  it('renders product cards with links', () => {
    render(<FeaturedProductsSection products={products} />);
    const links = screen.getAllByRole('link');
    const productLinks = links.filter((l) => l.getAttribute('href')?.startsWith('/products/'));
    expect(productLinks.length).toBe(2);
  });

  it('renders product names in card headings', () => {
    render(<FeaturedProductsSection products={products} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    const names = headings.map((h) => h.textContent);
    expect(names).toContain('Calacatta Gold');
    expect(names).toContain('Statuario');
  });

  it('renders nothing when products array is empty', () => {
    const { container } = render(<FeaturedProductsSection products={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders product tagline when available', () => {
    const productsWithTagline = [
      { id: '1', name: 'Calacatta', slug: 'calacatta', isFeatured: true, tagline: 'Italian white' },
    ];
    render(<FeaturedProductsSection products={productsWithTagline} />);
    expect(screen.getByText('Italian white')).toBeDefined();
  });
});

// ============================================================
// Collections Section
// ============================================================

describe('Homepage — Collections Section', () => {
  const collections = [
    { id: '1', name: 'Classic Marble', slug: 'classic-marble' },
    { id: '2', name: 'Onyx Series', slug: 'onyx-series' },
  ];

  it('renders section heading', () => {
    render(<CollectionsSection collections={collections} heading="Our Collections" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Our Collections');
  });

  it('renders collection card headings', () => {
    render(<CollectionsSection collections={collections} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    const names = headings.map((h) => h.textContent);
    expect(names).toContain('Classic Marble');
    expect(names).toContain('Onyx Series');
  });

  it('renders nothing when collections array is empty', () => {
    const { container } = render(<CollectionsSection collections={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

// ============================================================
// Applications Section
// ============================================================

describe('Homepage — Applications Section', () => {
  const applications = [
    { id: '1', name: 'Interior', slug: 'interior' },
    { id: '2', name: 'Exterior', slug: 'exterior' },
  ];

  it('renders section heading', () => {
    render(<ApplicationsSection applications={applications} heading="Use Cases" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Use Cases');
  });

  it('renders application card headings', () => {
    render(<ApplicationsSection applications={applications} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    const names = headings.map((h) => h.textContent);
    expect(names).toContain('Interior');
    expect(names).toContain('Exterior');
  });

  it('renders nothing when applications array is empty', () => {
    const { container } = render(<ApplicationsSection applications={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

// ============================================================
// Projects Section
// ============================================================

describe('Homepage — Projects Section', () => {
  const projects = [
    { id: '1', name: 'Hotel Project', slug: 'hotel-project' },
    { id: '2', name: 'Residential Tower', slug: 'residential-tower' },
  ];

  it('renders section heading', () => {
    render(<ProjectsSection projects={projects} heading="Our Work" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Our Work');
  });

  it('renders project card headings', () => {
    render(<ProjectsSection projects={projects} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    const names = headings.map((h) => h.textContent);
    expect(names).toContain('Hotel Project');
    expect(names).toContain('Residential Tower');
  });

  it('renders nothing when projects array is empty', () => {
    const { container } = render(<ProjectsSection projects={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

// ============================================================
// Journal Section
// ============================================================

describe('Homepage — Journal Section', () => {
  const articles = [
    { id: '1', title: 'Marble Trends', slug: 'marble-trends', summary: 'Latest trends', publicationDate: '2024-01-15' },
    { id: '2', title: 'Stone Care', slug: 'stone-care', summary: 'How to care', publicationDate: '2024-02-20' },
  ];

  it('renders section heading', () => {
    render(<JournalSection articles={articles} heading="Latest Insights" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Latest Insights');
  });

  it('renders article titles as h3', () => {
    render(<JournalSection articles={articles} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    const titles = headings.map((h) => h.textContent);
    expect(titles).toContain('Marble Trends');
    expect(titles).toContain('Stone Care');
  });

  it('renders article summaries', () => {
    render(<JournalSection articles={articles} />);
    expect(screen.getByText('Latest trends')).toBeDefined();
    expect(screen.getByText('How to care')).toBeDefined();
  });

  it('renders publication dates', () => {
    render(<JournalSection articles={articles} />);
    const dates = screen.getAllByRole('time');
    expect(dates.length).toBe(2);
  });

  it('renders nothing when articles array is empty', () => {
    const { container } = render(<JournalSection articles={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

// ============================================================
// Homepage CTA
// ============================================================

describe('Homepage — CTA', () => {
  it('renders heading', () => {
    render(
      <HomepageCTA
        heading="Start Your Project"
        primaryCTA={{ label: 'Get Quote', href: '/quote' }}
      />,
    );
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Start Your Project');
  });

  it('renders message when provided', () => {
    render(
      <HomepageCTA
        heading="Start Your Project"
        message="Let us help you"
        primaryCTA={{ label: 'Get Quote', href: '/quote' }}
      />,
    );
    expect(screen.getByText('Let us help you')).toBeDefined();
  });

  it('renders primary CTA link', () => {
    render(
      <HomepageCTA
        heading="CTA"
        primaryCTA={{ label: 'Get Quote', href: '/quote' }}
      />,
    );
    expect(screen.getByText('Get Quote').getAttribute('href')).toBe('/quote');
  });

  it('renders secondary CTA when provided', () => {
    render(
      <HomepageCTA
        heading="CTA"
        primaryCTA={{ label: 'Primary', href: '/primary' }}
        secondaryCTA={{ label: 'Secondary', href: '/secondary' }}
      />,
    );
    expect(screen.getByText('Secondary').getAttribute('href')).toBe('/secondary');
  });

  it('omits message when not provided', () => {
    const { container } = render(
      <HomepageCTA
        heading="CTA"
        primaryCTA={{ label: 'Go', href: '/go' }}
      />,
    );
    expect(container.querySelector('.homepage-cta__message')).toBeNull();
  });
});

// ============================================================
// Accessibility
// ============================================================

describe('Homepage — Accessibility', () => {
  it('hero content has h1', () => {
    const hero = {
      heading: 'Main Heading',
      primaryCTA: { label: 'Go', href: '/go' },
      secondaryCTA: { label: 'Back', href: '/back' },
    };
    render(<HeroContent hero={hero} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeDefined();
  });

  it('section headings use h2', () => {
    const products = [{ id: '1', name: 'Test', slug: 'test', isFeatured: true }];
    render(<FeaturedProductsSection products={products} />);
    const h2 = screen.getByRole('heading', { level: 2 });
    expect(h2).toBeDefined();
  });

  it('product card links have accessible labels', () => {
    const products = [{ id: '1', name: 'Calacatta', slug: 'calacatta', isFeatured: true }];
    render(<FeaturedProductsSection products={products} />);
    const link = screen.getByRole('link', { name: 'Calacatta' });
    expect(link).toBeDefined();
  });

  it('collection card links have accessible labels', () => {
    const collections = [{ id: '1', name: 'Classic', slug: 'classic' }];
    render(<CollectionsSection collections={collections} />);
    const link = screen.getByRole('link', { name: 'Classic' });
    expect(link).toBeDefined();
  });

  it('CTA section has heading', () => {
    render(
      <HomepageCTA
        heading="Contact Us"
        primaryCTA={{ label: 'Go', href: '/go' }}
      />,
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toBeDefined();
  });

  it('hero fallback has h1', () => {
    const hero = {
      heading: 'Brand',
      primaryCTA: { label: 'Go', href: '/go' },
      secondaryCTA: { label: 'Back', href: '/back' },
    };
    render(<HeroFallback hero={hero} />);
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeDefined();
  });

  it('all card links are keyboard accessible', () => {
    const products = [
      { id: '1', name: 'A', slug: 'a', isFeatured: true },
      { id: '2', name: 'B', slug: 'b', isFeatured: true },
    ];
    render(<FeaturedProductsSection products={products} />);
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      expect(link.tagName).toBe('A');
    });
  });
});

// ============================================================
// Section Order
// ============================================================

describe('Homepage — Section Order', () => {
  it('HomepageContent type has sectionOrder array', () => {
    const data = makeHomepageContent({
      sectionOrder: ['featured_products', 'featured_collections'],
      sections: [
        { type: 'featured_products', products: [] },
        { type: 'featured_collections', collections: [] },
      ],
    });
    expect(data.sectionOrder).toEqual(['featured_products', 'featured_collections']);
  });

  it('sections array matches sectionOrder types', () => {
    const data = makeHomepageContent({
      sectionOrder: ['featured_products', 'featured_collections'],
      sections: [
        { type: 'featured_products', products: [] },
        { type: 'featured_collections', collections: [] },
      ],
    });
    const ordered = data.sectionOrder
      .map((t) => data.sections.find((s) => s.type === t))
      .filter(Boolean);
    expect(ordered.length).toBe(2);
    expect(ordered[0]?.type).toBe('featured_products');
    expect(ordered[1]?.type).toBe('featured_collections');
  });
});

// ============================================================
// Empty States
// ============================================================

describe('Homepage — Empty States', () => {
  it('empty products array renders nothing', () => {
    const { container } = render(<FeaturedProductsSection products={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('empty collections array renders nothing', () => {
    const { container } = render(<CollectionsSection collections={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('empty applications array renders nothing', () => {
    const { container } = render(<ApplicationsSection applications={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('empty projects array renders nothing', () => {
    const { container } = render(<ProjectsSection projects={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('empty articles array renders nothing', () => {
    const { container } = render(<JournalSection articles={[]} />);
    expect(container.innerHTML).toBe('');
  });
});
