import type { ProductSummary } from '@/types/api';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
  products: ProductSummary[];
  locale?: string;
  title?: string;
}

export function RelatedProducts({ products, locale, title }: RelatedProductsProps) {
  if (products.length === 0) return null;

  const heading = title || (locale === 'tr' ? 'İlgili Ürünler' : 'Related Products');

  return (
    <div className="product-relationships__section">
      <h2 className="product-relationships__heading">{heading}</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </div>
    </div>
  );
}
