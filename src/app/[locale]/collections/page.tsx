import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getCollections } from '@/lib/data/collections';
import { CollectionGrid } from '@/components/collection/CollectionGrid';
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
    title: locale === 'tr' ? 'Koleksiyonlar' : 'Collections',
    description:
      locale === 'tr'
        ? 'Doğal taş koleksiyonlarımızı keşfedin.'
        : 'Explore our natural stone collections.',
    alternates: {
      canonical: `${baseUrl}/${locale}/collections`,
      languages: Object.fromEntries(
        ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${baseUrl}/${l}/collections`])
      ),
    },
  };
}

export default async function CollectionsPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let result;
  try {
    result = await getCollections(locale);
  } catch {
    notFound();
  }

  const { data: collections } = result;

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
            style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
          >
            {locale === 'tr' ? 'Malzeme Koleksiyonları' : 'Material Collections'}
          </span>
          <h1 className="text-h1">
            {locale === 'tr' ? 'Koleksiyonlar' : 'Collections'}
          </h1>
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
          <CollectionGrid collections={collections} />
        )}
      </Container>
    </main>
  );
}
