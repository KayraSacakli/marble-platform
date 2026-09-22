import type { CollectionSummary } from '@/types/api';
import { CollectionCard } from './CollectionCard';

interface CollectionGridProps {
  collections: CollectionSummary[];
}

export function CollectionGrid({ collections }: CollectionGridProps) {
  if (collections.length === 0) return null;

  return (
    <div className="collection-grid">
      {collections.map((collection, index) => (
        <CollectionCard
          key={collection.id}
          collection={collection}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
