import type { CollectionSummary } from '@/types/api';

interface CollectionCardProps {
  collection: CollectionSummary;
  priority?: boolean;
}

export function CollectionCard({ collection, priority = false }: CollectionCardProps) {
  return (
    <article className="collection-card">
      <a
        href={`/collections/${collection.slug}`}
        className="card-link-overlay"
        aria-label={collection.name}
      >
        <span className="sr-only">{collection.name}</span>
      </a>
      <div className="collection-card__image-wrap">
        {collection.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={collection.coverImage.src}
            alt={collection.coverImage.alt}
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
              {collection.name}
            </span>
          </div>
        )}
      </div>
      <div className="collection-card__body">
        <h3 className="collection-card__name">{collection.name}</h3>
        {collection.description && (
          <p className="collection-card__description">{collection.description}</p>
        )}
      </div>
    </article>
  );
}
