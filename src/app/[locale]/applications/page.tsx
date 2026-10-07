import { notFound } from 'next/navigation';
import { notFoundOnlyWhenMissing } from '@/lib/api/page-errors';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getApplications } from '@/lib/data/applications';
import { ApplicationGrid } from '@/components/application/ApplicationGrid';
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

  const title = locale === 'tr' ? 'Uygulamalar' : 'Applications';
  const description =
    locale === 'tr'
      ? 'Mermerin mimarideki kullanım alanlarını keşfedin.'
      : 'Explore how marble is used in architecture.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'}/${locale}/applications`,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    ...gatedMetadata(
      locale,
      '/applications',
      sectionLocales(await getSeoAvailability(), 'applications'),
    ),
  };
}

export default async function ApplicationsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const pageSize = DEFAULT_PAGE_SIZE;

  let result;
  try {
    result = await getApplications(locale, { page, pageSize });
  } catch (error) {
    notFoundOnlyWhenMissing(error);
  }

  const { data: applications, meta } = result;

  return (
    <main className="application-page">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Uygulamalar' : 'Applications' },
          ]}
        />

        <div className="application-page__header">
          <span
            className="text-label"
            style={{
              color: 'var(--color-text-secondary)',
              display: 'block',
              marginBottom: 'var(--space-3)',
            }}
          >
            {locale === 'tr' ? 'Mimari Kullanım' : 'Architectural Use'}
          </span>
          <h1 className="text-h1">{locale === 'tr' ? 'Uygulamalar' : 'Applications'}</h1>
          <p className="application-page__intro">
            {locale === 'tr'
              ? 'Mermerin mimaride ve mekânda nasıl kullanıldığını keşfedin.'
              : 'Discover how marble is used in architecture and space.'}
          </p>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state__heading">
              {locale === 'tr' ? 'Uygulama Bulunamadı' : 'No Applications Found'}
            </h2>
            <p className="empty-state__message">
              {locale === 'tr'
                ? 'Şu anda görüntülenecek uygulama bulunmamaktadır.'
                : 'There are no applications to display at this time.'}
            </p>
            <a href={`/${locale}`} className="button button--secondary button--md">
              {locale === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Homepage'}
            </a>
          </div>
        ) : (
          <>
            <ApplicationGrid applications={applications} locale={locale} />
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              locale={locale}
              basePath="/applications"
            />
          </>
        )}
      </Container>
    </main>
  );
}
