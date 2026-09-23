import type { CollectionSummary } from '@/types/api';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface CollectionsSectionProps {
  heading?: string;
  collections: CollectionSummary[];
  locale: string;
}

export function CollectionsSection({ heading, collections, locale }: CollectionsSectionProps) {
  if (collections.length === 0) return null;

  const displayHeading = heading || 'Collections';

  return (
    <section className="homepage-section">
      <Container size="lg">
        <SectionHeader
          eyebrow="Material Language"
          title={displayHeading}
        />
        <div className="collections-grid">
          {collections.map((collection) => (
            <CollectionCard key={collection.id} collection={collection} locale={locale} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function CollectionCard({ collection, locale }: { collection: CollectionSummary; locale: string }) {
  const href = locale ? `/${locale}/collections/${collection.slug}` : `/collections/${collection.slug}`;

  return (
    <article className="collection-card">
      <a href={href} className="card-link-overlay" aria-label={collection.name}>
        <span className="sr-only">{collection.name}</span>
      </a>
      <div className="collection-card__image-wrap">
        {collection.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={collection.coverImage.src}
            alt={collection.coverImage.alt}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-bg-tertiary)' }} />
        )}
      </div>
      <div className="collection-card__body">
        <h3 className="collection-card__name">{collection.name}</h3>
        {collection.description && (
          <p className="collection-card__desc">{collection.description}</p>
        )}
      </div>
    </article>
  );
}
