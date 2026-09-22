import type { ProductSummary } from '@/types/api';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
  products: ProductSummary[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="product-relationships__section">
      <h2 className="product-relationships__heading">Related Products</h2>
      <div className="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
