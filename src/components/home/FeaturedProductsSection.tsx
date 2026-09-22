import type { ProductSummary } from '@/types/api';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface FeaturedProductsSectionProps {
  heading?: string;
  products: ProductSummary[];
}

export function FeaturedProductsSection({ heading, products }: FeaturedProductsSectionProps) {
  if (products.length === 0) return null;

  const displayHeading = heading || 'Featured Products';

  return (
    <section className="homepage-section">
      <Container size="lg">
        <SectionHeader
          eyebrow="Collection"
          title={displayHeading}
        />
        <div className="products-grid products-grid--editorial">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} featured={index === 0} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function ProductCard({ product, featured }: { product: ProductSummary; featured: boolean }) {
  return (
    <article className={`product-card ${featured ? 'product-card--featured' : ''}`}>
      <a href={`/products/${product.slug}`} className="card-link-overlay" aria-label={product.name}>
        <span className="sr-only">{product.name}</span>
      </a>
      <div className={`product-card__image-wrap ${featured ? 'product-card__image-wrap--large' : ''}`}>
        {product.primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primaryImage.src}
            alt={product.primaryImage.alt}
            loading={featured ? 'eager' : 'lazy'}
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-bg-tertiary)' }} />
        )}
      </div>
      <div className="product-card__body">
        <h3 className="product-card__name">{product.name}</h3>
        {product.tagline && (
          <p className="product-card__tagline">{product.tagline}</p>
        )}
      </div>
    </article>
  );
}
