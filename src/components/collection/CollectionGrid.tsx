import type { CollectionSummary } from '@/types/api';
import { CollectionCard } from './CollectionCard';

interface CollectionGridProps {
  collections: CollectionSummary[];
  locale: string;
}

export function CollectionGrid({ collections, locale }: CollectionGridProps) {
  if (collections.length === 0) return null;

  return (
    <div className="collection-grid">
      {collections.map((collection, index) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          locale={locale}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
