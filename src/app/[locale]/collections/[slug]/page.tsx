import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getCollection } from '@/lib/data/collections';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  try {
    const collection = await getCollection(locale, slug);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

    return {
      title: collection.name,
      description: collection.description || collection.seo?.metaDescription,
      alternates: {
        canonical: `${baseUrl}/${locale}/collections/${collection.slug}`,
        languages: Object.fromEntries(
          ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${baseUrl}/${l}/collections/${collection.slug}`])
        ),
      },
    };
  } catch {
    return {};
  }
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let collection;
  try {
    collection = await getCollection(locale, slug);
  } catch {
    notFound();
  }

  return (
    <main className="collection-detail">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Koleksiyonlar' : 'Collections', href: `/${locale}/collections` },
            { label: collection.name },
          ]}
        />

        <div className="collection-hero">
          <div className="collection-hero__info">
            <h1 className="collection-hero__name">{collection.name}</h1>

            {collection.description && (
              <p className="collection-hero__description">{collection.description}</p>
            )}
          </div>

          {collection.coverImage && (
            <div className="collection-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={collection.coverImage.src}
                alt={collection.coverImage.alt}
                loading="eager"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        {collection.description && (
          <section className="collection-description">
            <div
              className="collection-description__content"
              dangerouslySetInnerHTML={{ __html: collection.description }}
            />
          </section>
        )}

        {collection.products.length > 0 && (
          <section className="collection-products">
            <h2 className="collection-products__heading">
              {locale === 'tr' ? 'Bu Koleksiyondaki Ürünler' : 'Products in This Collection'}
            </h2>
            <div className="collection-grid">
              {collection.products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 3}
                />
              ))}
            </div>
          </section>
        )}

        {collection.applications.length > 0 && (
          <section className="collection-relationships">
            <h2 className="collection-relationships__heading">
              {locale === 'tr' ? 'İlgili Uygulamalar' : 'Related Applications'}
            </h2>
            <div className="collection-relationships__grid">
              {collection.applications.map((app) => (
                <a
                  key={app.id}
                  href={`/${locale}/applications/${app.slug}`}
                  className="relationship-card"
                >
                  <div className="relationship-card__body">
                    <h3 className="relationship-card__name">{app.name}</h3>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="collection-cta">
          <h2 className="collection-cta__heading">
            {locale === 'tr' ? 'Bu Koleksiyon Hakkında Konuşalım' : 'Let\'s Discuss This Collection'}
          </h2>
          <p className="collection-cta__message">
            {locale === 'tr'
              ? 'Projeniz için doğru malzemeyi seçmenize yardımcı olalım.'
              : 'Let us help you choose the right material for your project.'}
          </p>
          <a href={`/${locale}/quote`} className="button button--primary button--lg">
            {locale === 'tr' ? 'Teklif İste' : 'Request a Quote'}
          </a>
        </section>
      </Container>
    </main>
  );
}
