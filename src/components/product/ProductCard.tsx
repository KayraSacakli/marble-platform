import type { ProductSummary } from '@/types/api';

interface ProductCardProps {
  product: ProductSummary;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  return (
    <article className="product-card">
      <a
        href={`/products/${product.slug}`}
        className="card-link-overlay"
        aria-label={product.name}
      >
        <span className="sr-only">{product.name}</span>
      </a>
      <div className="product-card__image-wrap">
        {product.primaryImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primaryImage.src}
            alt={product.primaryImage.alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'var(--color-bg-tertiary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="text-body-small" style={{ color: 'var(--color-text-tertiary)' }}>
              {product.name}
            </span>
          </div>
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
