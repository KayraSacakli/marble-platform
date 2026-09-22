import type { ContentSummary } from '@/types/api';

interface RelatedContentProps {
  title: string;
  items: ContentSummary[];
  basePath: string;
}

export function RelatedContent({ title, items, basePath }: RelatedContentProps) {
  if (items.length === 0) return null;

  return (
    <div className="product-relationships__section">
      <h2 className="product-relationships__heading">{title}</h2>
      <div className="product-relationships__grid">
        {items.map((item) => (
          <a
            key={item.id}
            href={`/${basePath}/${item.slug}`}
            className="relationship-card card-link-overlay"
            aria-label={item.name}
          >
            <div className="relationship-card__body">
              <span className="relationship-card__name">{item.name}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
