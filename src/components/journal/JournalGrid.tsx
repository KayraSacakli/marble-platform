import type { JournalSummary } from '@/types/api';
import { JournalCard } from './JournalCard';

interface JournalGridProps {
  articles: JournalSummary[];
  locale: string;
}

export function JournalGrid({ articles, locale }: JournalGridProps) {
  if (articles.length === 0) return null;

  return (
    <div className="journal-listing-grid">
      {articles.map((article, index) => (
        <JournalCard
          key={article.id}
          article={article}
          locale={locale}
          priority={index < 3}
        />
      ))}
    </div>
  );
}
