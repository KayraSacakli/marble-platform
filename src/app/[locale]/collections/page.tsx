import { notFound } from 'next/navigation';
import { notFoundOnlyWhenMissing } from '@/lib/api/page-errors';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getCollections } from '@/lib/data/collections';
import { CollectionGrid } from '@/components/collection/CollectionGrid';
import { Pagination } from '@/components/product/Pagination';
import { DEFAULT_PAGE_SIZE } from '@/types/api';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { gatedMetadata, getSeoAvailability, sectionLocales } from '@/lib/seo/gates';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const title = locale === 'tr' ? 'Koleksiyonlar' : 'Collections';
  const description =
    locale === 'tr'
      ? 'Doğal taş koleksiyonlarımızı keşfedin.'
      : 'Explore our natural stone collections.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/${locale}/collections`,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    ...gatedMetadata(
      locale,
      '/collections',
      sectionLocales(await getSeoAvailability(), 'collections'),
    ),
  };
}

export default async function CollectionsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;

  let result;
  try {
    result = await getCollections(locale, { page, pageSize });
  } catch (error) {
    notFoundOnlyWhenMissing(error);
  }

  const { data: collections, meta } = result;

  return (
    <main className="collection-page">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Koleksiyonlar' : 'Collections' },
          ]}
        />

        <div className="collection-page__header">
          <span
            className="text-label"
            style={{
              color: 'var(--color-text-secondary)',
              display: 'block',
              marginBottom: 'var(--space-3)',
            }}
          >
            {locale === 'tr' ? 'Malzeme Koleksiyonları' : 'Material Collections'}
          </span>
          <h1 className="text-h1">{locale === 'tr' ? 'Koleksiyonlar' : 'Collections'}</h1>
          <p className="collection-page__intro">
            {locale === 'tr'
              ? 'Her koleksiyon, benzersiz bir taş ailesini ve malzeme karakterini temsil eder.'
              : 'Each collection represents a unique stone family and material character.'}
          </p>
        </div>

        {collections.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state__heading">
              {locale === 'tr' ? 'Koleksiyon Bulunamadı' : 'No Collections Found'}
            </h2>
            <p className="empty-state__message">
              {locale === 'tr'
                ? 'Şu anda görüntülenecek koleksiyon bulunmamaktadır.'
                : 'There are no collections to display at this time.'}
            </p>
            <a href={`/${locale}`} className="button button--secondary button--md">
              {locale === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Homepage'}
            </a>
          </div>
        ) : (
          <>
            <CollectionGrid collections={collections} locale={locale} />
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              locale={locale}
              basePath="/collections"
            />
          </>
        )}
      </Container>
    </main>
  );
}
