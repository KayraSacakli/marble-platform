import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getApplications } from '@/lib/data/applications';
import { ApplicationGrid } from '@/components/application/ApplicationGrid';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    title: locale === 'tr' ? 'Uygulamalar' : 'Applications',
    description:
      locale === 'tr'
        ? 'Mermerin mimarideki kullanım alanlarını keşfedin.'
        : 'Explore how marble is used in architecture.',
    alternates: {
      canonical: `${baseUrl}/${locale}/applications`,
      languages: Object.fromEntries(
        ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${baseUrl}/${l}/applications`])
      ),
    },
  };
}

export default async function ApplicationsPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let result;
  try {
    result = await getApplications(locale);
  } catch {
    notFound();
  }

  const { data: applications } = result;

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
            style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
          >
            {locale === 'tr' ? 'Mimari Kullanım' : 'Architectural Use'}
          </span>
          <h1 className="text-h1">
            {locale === 'tr' ? 'Uygulamalar' : 'Applications'}
          </h1>
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
          <ApplicationGrid applications={applications} />
        )}
      </Container>
    </main>
  );
}
