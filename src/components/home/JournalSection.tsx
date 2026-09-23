import type { JournalSummary } from '@/types/api';
import { Container } from '@/components/ui/Container';
import { SectionHeader } from '@/components/ui/SectionHeader';

interface JournalSectionProps {
  heading?: string;
  articles: JournalSummary[];
  locale: string;
}

export function JournalSection({ heading, articles, locale }: JournalSectionProps) {
  if (articles.length === 0) return null;

  const displayHeading = heading || 'Journal';

  return (
    <section className="homepage-section">
      <Container size="lg">
        <SectionHeader
          eyebrow="Insights"
          title={displayHeading}
        />
        <div className="journal-grid">
          {articles.map((article, index) => (
            <JournalCard key={article.id} article={article} featured={index === 0} locale={locale} />
          ))}
        </div>
      </Container>
    </section>
  );
}

function JournalCard({ article, featured, locale }: { article: JournalSummary; featured: boolean; locale: string }) {
  const href = locale ? `/${locale}/journal/${article.slug}` : `/journal/${article.slug}`;

  return (
    <article className={`journal-card ${featured ? 'journal-card--featured' : ''}`}>
      <a href={href} className="card-link-overlay" aria-label={article.title}>
        <span className="sr-only">{article.title}</span>
      </a>
      <div className="journal-card__image-wrap">
        {article.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImage.src}
            alt={article.coverImage.alt}
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--color-bg-tertiary)' }} />
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
