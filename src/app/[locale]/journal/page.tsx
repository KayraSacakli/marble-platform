import { notFound } from 'next/navigation';
import { notFoundOnlyWhenMissing } from '@/lib/api/page-errors';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getJournal } from '@/lib/data/journal';
import { JournalGrid } from '@/components/journal/JournalGrid';
import { Pagination } from '@/components/product/Pagination';
import { DEFAULT_PAGE_SIZE } from '@/types/api';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { gatedMetadata, getSeoAvailability, sectionLocales } from '@/lib/seo/gates';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const title = locale === 'tr' ? 'Dergi' : 'Journal';
  const description =
    locale === 'tr'
      ? 'Doğal taş, mimarlık ve tasarım üzerine yazılar.'
      : 'Articles on natural stone, architecture, and design.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/${locale}/journal`,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    ...gatedMetadata(locale, '/journal', sectionLocales(await getSeoAvailability(), 'journal')),
  };
}

export default async function JournalPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;

  let result;
  try {
    result = await getJournal(locale, { page, pageSize });
  } catch (error) {
    notFoundOnlyWhenMissing(error);
  }

  const { data: articles, meta } = result;

  return (
    <main className="journal-page">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Dergi' : 'Journal' },
          ]}
        />

        <div className="journal-page__header">
          <span
            className="text-label"
            style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
          >
            {locale === 'tr' ? 'Bilgi ve Görüşler' : 'Insights & Perspectives'}
          </span>
          <h1 className="text-h1">
            {locale === 'tr' ? 'Dergi' : 'Journal'}
          </h1>
          <p className="journal-page__intro">
            {locale === 'tr'
              ? 'Doğal taş, mimarlık ve tasarım üzerine derinlemesine yazılar.'
              : 'In-depth articles on natural stone, architecture, and design.'}
          </p>
        </div>

        {articles.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state__heading">
              {locale === 'tr' ? 'Makale Bulunamadı' : 'No Articles Found'}
            </h2>
            <p className="empty-state__message">
              {locale === 'tr'
                ? 'Şu anda görüntülenecek makale bulunmamaktadır.'
                : 'There are no articles to display at this time.'}
            </p>
            <a href={`/${locale}`} className="button button--secondary button--md">
              {locale === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Homepage'}
            </a>
          </div>
        ) : (
          <>
            <JournalGrid articles={articles} locale={locale} />
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              locale={locale}
              basePath="/journal"
            />
          </>
        )}
      </Container>
    </main>
  );
}
