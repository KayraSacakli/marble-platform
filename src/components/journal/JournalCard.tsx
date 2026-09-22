import type { JournalSummary } from '@/types/api';

interface JournalCardProps {
  article: JournalSummary;
  priority?: boolean;
}

export function JournalCard({ article, priority = false }: JournalCardProps) {
  return (
    <article className="journal-card">
      <a
        href={`/journal/${article.slug}`}
        className="card-link-overlay"
        aria-label={article.title}
      >
        <span className="sr-only">{article.title}</span>
      </a>
      <div className="journal-card__image-wrap">
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage.src}
            alt={article.coverImage.alt}
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
              {article.title}
            </span>
          </div>
        )}
      </div>
      <div className="journal-card__body">
        <div className="journal-card__meta">
          {article.publicationDate && (
            <time className="journal-card__date" dateTime={article.publicationDate}>
              {new Date(article.publicationDate).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
          {article.author && (
            <span className="journal-card__author">{article.author}</span>
          )}
        </div>
        <h3 className="journal-card__title">{article.title}</h3>
        {article.summary && (
          <p className="journal-card__summary">{article.summary}</p>
        )}
      </div>
    </article>
  );
}
