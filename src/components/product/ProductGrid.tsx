import type { ProductSummary } from '@/types/api';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: ProductSummary[];
  locale?: string;
}

export function ProductGrid({ products, locale }: ProductGridProps) {
  if (products.length === 0) return null;

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 3}
          locale={locale}
        />
      ))}
    </div>
  );
}
