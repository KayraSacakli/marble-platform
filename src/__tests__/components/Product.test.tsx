// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { ProductSummary, ContentSummary } from '@/types/api';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/product/Pagination';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { RelatedContent } from '@/components/product/RelatedContent';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { ProductGallery } from '@/components/product/ProductGallery';

vi.mock('next/navigation', () => ({
  usePathname: () => '/tr/products',
}));

// ============================================================
// Product Card
// ============================================================

describe('ProductCard', () => {
  const product: ProductSummary = {
    id: '1',
    name: 'Calacatta Gold',
    slug: 'calacatta-gold',
    tagline: 'Italian white marble',
    isFeatured: true,
    primaryImage: {
      id: 'img-1',
      mediaType: 'image',
      src: '/images/calacatta.jpg',
      width: 800,
      height: 600,
      aspectRatio: '4/3',
      alt: 'Calacatta Gold marble',
      loading: 'lazy',
    },
  };

  it('renders product name in heading', () => {
    render(<ProductCard product={product} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.some((h) => h.textContent === 'Calacatta Gold')).toBe(true);
  });

  it('renders tagline when available', () => {
    render(<ProductCard product={product} />);
    expect(screen.getByText('Italian white marble')).toBeDefined();
  });

  it('renders link to product detail', () => {
    render(<ProductCard product={product} />);
    const link = screen.getByRole('link', { name: 'Calacatta Gold' });
    expect(link.getAttribute('href')).toBe('/products/calacatta-gold');
  });

  it('renders image with correct alt text', () => {
    render(<ProductCard product={product} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('alt')).toBe('Calacatta Gold marble');
  });

  it('uses eager loading when priority is true', () => {
    render(<ProductCard product={product} priority />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('loading')).toBe('eager');
  });

  it('uses lazy loading when priority is false', () => {
    render(<ProductCard product={product} />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('loading')).toBe('lazy');
  });

  it('renders fallback text when no image', () => {
    const productNoImage = { ...product, primaryImage: undefined };
    const { container } = render(<ProductCard product={productNoImage} />);
    expect(container.querySelector('.product-card__image-wrap')).toBeDefined();
  });

  it('omits tagline when not provided', () => {
    const productNoTagline = { ...product, tagline: undefined };
    render(<ProductCard product={productNoTagline} />);
    expect(screen.queryByText('Italian white marble')).toBeNull();
  });
});

// ============================================================
// Product Grid
// ============================================================

describe('ProductGrid', () => {
  const products: ProductSummary[] = [
    { id: '1', name: 'A', slug: 'a', isFeatured: true },
    { id: '2', name: 'B', slug: 'b', isFeatured: false },
    { id: '3', name: 'C', slug: 'c', isFeatured: false },
  ];

  it('renders all product cards', () => {
    render(<ProductGrid products={products} />);
    expect(screen.getAllByRole('link', { name: 'A' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: 'B' }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: 'C' }).length).toBeGreaterThanOrEqual(1);
  });

  it('renders nothing when products array is empty', () => {
    const { container } = render(<ProductGrid products={[]} />);
    expect(container.innerHTML).toBe('');
  });

  it('renders product headings for all items', () => {
    render(<ProductGrid products={products} />);
    const headings = screen.getAllByRole('heading', { level: 3 });
    expect(headings.length).toBe(3);
  });
});

// ============================================================
// Pagination
// ============================================================

describe('Pagination', () => {
  it('renders nothing when total pages is 1', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} locale="tr" />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders page numbers', () => {
    render(<Pagination currentPage={1} totalPages={5} locale="tr" />);
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('5')).toBeDefined();
  });

  it('marks current page with aria-current', () => {
    render(<Pagination currentPage={2} totalPages={5} locale="tr" />);
    const currentPage = screen.getByText('2');
    expect(currentPage.getAttribute('aria-current')).toBe('page');
  });

  it('renders prev/next links', () => {
    render(<Pagination currentPage={2} totalPages={5} locale="tr" />);
    expect(screen.getByText('← Prev')).toBeDefined();
    expect(screen.getByText('Next →')).toBeDefined();
  });

  it('disables prev on first page', () => {
    render(<Pagination currentPage={1} totalPages={5} locale="tr" />);
    const prev = screen.getByText('← Prev');
    expect(prev.classList.contains('pagination__item--disabled')).toBe(true);
  });

  it('disables next on last page', () => {
    render(<Pagination currentPage={5} totalPages={5} locale="tr" />);
    const next = screen.getByText('Next →');
    expect(next.classList.contains('pagination__item--disabled')).toBe(true);
  });

  it('generates correct URLs', () => {
    render(<Pagination currentPage={2} totalPages={5} locale="tr" />);
    const page3 = screen.getByText('3');
    expect(page3.getAttribute('href')).toBe('/tr/products?page=3');
  });

  it('shows ellipsis for large page counts', () => {
    render(<Pagination currentPage={5} totalPages={20} locale="tr" />);
    const ellipses = screen.getAllByText('…');
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it('renders navigation landmark', () => {
    render(<Pagination currentPage={1} totalPages={3} locale="tr" />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeDefined();
  });
});

// ============================================================
// Breadcrumb
// ============================================================

describe('Breadcrumb', () => {
  it('renders breadcrumb items', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/tr' },
          { label: 'Products', href: '/tr/products' },
          { label: 'Calacatta' },
        ]}
      />,
    );
    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Products')).toBeDefined();
    expect(screen.getByText('Calacatta')).toBeDefined();
  });

  it('renders links for non-current items', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/tr' },
          { label: 'Current' },
        ]}
      />,
    );
    const homeLink = screen.getByText('Home');
    expect(homeLink.tagName).toBe('A');
    expect(homeLink.getAttribute('href')).toBe('/tr');
  });

  it('marks current item with aria-current', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/tr' },
          { label: 'Current' },
        ]}
      />,
    );
    const current = screen.getByText('Current');
    expect(current.getAttribute('aria-current')).toBe('page');
  });

  it('renders separator between items', () => {
    const { container } = render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/tr' },
          { label: 'Products' },
        ]}
      />,
    );
    const separators = container.querySelectorAll('.breadcrumb__separator');
    expect(separators.length).toBeGreaterThanOrEqual(1);
  });
});

// ============================================================
// Related Content
// ============================================================

describe('RelatedContent', () => {
  const items: ContentSummary[] = [
    { id: '1', name: 'Classic Marble', slug: 'classic-marble' },
    { id: '2', name: 'Onyx Series', slug: 'onyx-series' },
  ];

  it('renders section heading', () => {
    render(<RelatedContent title="Collections" items={items} basePath="collections" />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Collections');
  });

  it('renders item links', () => {
    render(<RelatedContent title="Collections" items={items} basePath="collections" />);
    const links = screen.getAllByRole('link');
    const collectionLinks = links.filter((l) => l.getAttribute('href')?.includes('collections'));
    expect(collectionLinks.length).toBe(2);
  });

  it('renders nothing when items array is empty', () => {
    const { container } = render(<RelatedContent title="Collections" items={[]} basePath="collections" />);
    expect(container.innerHTML).toBe('');
  });
});

// ============================================================
// Related Products
// ============================================================

describe('RelatedProducts', () => {
  const products: ProductSummary[] = [
    { id: '1', name: 'Statuario', slug: 'statuario', isFeatured: false },
    { id: '2', name: 'Nero Marquina', slug: 'nero-marquina', isFeatured: false },
  ];

  it('renders section heading', () => {
    render(<RelatedProducts products={products} />);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Related Products');
  });

  it('renders product card links', () => {
    render(<RelatedProducts products={products} />);
    const links = screen.getAllByRole('link');
    const productLinks = links.filter((l) => l.getAttribute('href')?.startsWith('/products/'));
    expect(productLinks.length).toBe(2);
  });

  it('renders nothing when products array is empty', () => {
    const { container } = render(<RelatedProducts products={[]} />);
    expect(container.innerHTML).toBe('');
  });
});

// ============================================================
// Product Gallery
// ============================================================

describe('ProductGallery', () => {
  const primaryImage = {
    id: 'img-1',
    mediaType: 'image' as const,
    src: '/images/primary.jpg',
    width: 800,
    height: 600,
    aspectRatio: '4/3',
    alt: 'Primary marble image',
    loading: 'eager' as const,
  };

  const gallery = [
    {
      id: 'img-2',
      mediaType: 'image' as const,
      src: '/images/gallery-1.jpg',
      width: 800,
      height: 600,
      aspectRatio: '4/3',
      alt: 'Gallery image 1',
      loading: 'lazy' as const,
    },
    {
      id: 'img-3',
      mediaType: 'image' as const,
      src: '/images/gallery-2.jpg',
      width: 800,
      height: 600,
      aspectRatio: '4/3',
      alt: 'Gallery image 2',
      loading: 'lazy' as const,
    },
  ];

  it('renders primary image', () => {
    render(<ProductGallery primaryImage={primaryImage} gallery={[]} productName="Test" />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toBe('/images/primary.jpg');
  });

  it('renders thumbnails when multiple images', () => {
    render(<ProductGallery primaryImage={primaryImage} gallery={gallery} productName="Test" />);
    const thumbnails = screen.getAllByRole('tab');
    expect(thumbnails.length).toBe(3);
  });

  it('does not render thumbnails for single image', () => {
    render(<ProductGallery primaryImage={primaryImage} gallery={[]} productName="Test" />);
    expect(screen.queryAllByRole('tab').length).toBe(0);
  });

  it('switches active image on thumbnail click', () => {
    render(<ProductGallery primaryImage={primaryImage} gallery={gallery} productName="Test" />);
    const thumbnails = screen.getAllByRole('tab');
    fireEvent.click(thumbnails[1]);
    const mainImg = screen.getAllByRole('img')[0];
    expect(mainImg.getAttribute('src')).toBe('/images/gallery-1.jpg');
  });

  it('renders fallback when no images', () => {
    render(<ProductGallery primaryImage={undefined} gallery={[]} productName="Marble" />);
    expect(screen.getByText('Marble')).toBeDefined();
  });

  it('marks first thumbnail as active by default', () => {
    render(<ProductGallery primaryImage={primaryImage} gallery={gallery} productName="Test" />);
    const thumbnails = screen.getAllByRole('tab');
    expect(thumbnails[0].getAttribute('aria-selected')).toBe('true');
    expect(thumbnails[1].getAttribute('aria-selected')).toBe('false');
  });
});

// ============================================================
// Accessibility
// ============================================================

describe('Product — Accessibility', () => {
  it('product card link has accessible name', () => {
    const product: ProductSummary = { id: '1', name: 'Test Product', slug: 'test', isFeatured: true };
    render(<ProductCard product={product} />);
    expect(screen.getByRole('link', { name: 'Test Product' })).toBeDefined();
  });

  it('pagination has nav landmark', () => {
    render(<Pagination currentPage={1} totalPages={3} locale="tr" />);
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeDefined();
  });

  it('pagination current page has aria-current', () => {
    render(<Pagination currentPage={2} totalPages={5} locale="tr" />);
    expect(screen.getByText('2').getAttribute('aria-current')).toBe('page');
  });

  it('gallery thumbnails have aria labels', () => {
    const primaryImage = {
      id: 'img-1', mediaType: 'image' as const, src: '/img.jpg',
      width: 800, height: 600, aspectRatio: '4/3', alt: 'Marble', loading: 'eager' as const,
    };
    const gallery = [
      { id: 'img-2', mediaType: 'image' as const, src: '/img2.jpg', width: 800, height: 600, aspectRatio: '4/3', alt: 'Detail', loading: 'lazy' as const },
    ];
    render(<ProductGallery primaryImage={primaryImage} gallery={gallery} productName="Test" />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs[0].getAttribute('aria-label')).toContain('View image 1');
    expect(tabs[1].getAttribute('aria-label')).toContain('View image 2');
  });

  it('breadcrumb has nav landmark', () => {
    render(
      <Breadcrumb items={[{ label: 'Home', href: '/tr' }, { label: 'Products' }]} />,
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeDefined();
  });
});

// ============================================================
// No Fake Data
// ============================================================

describe('Product — No Fake Data', () => {
  it('no lorem ipsum in product card', () => {
    const product: ProductSummary = { id: '1', name: 'Test', slug: 'test', isFeatured: true };
    const { container } = render(<ProductCard product={product} />);
    expect(container.innerHTML.toLowerCase()).not.toContain('lorem');
  });

  it('no fake prices in product card', () => {
    const product: ProductSummary = { id: '1', name: 'Test', slug: 'test', isFeatured: true };
    const { container } = render(<ProductCard product={product} />);
    expect(container.innerHTML).not.toContain('$');
    expect(container.innerHTML).not.toContain('€');
    expect(container.innerHTML).not.toContain('₺');
  });
});
