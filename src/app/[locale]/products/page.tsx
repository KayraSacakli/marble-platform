import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getProducts } from '@/lib/data/products';
import { ProductGrid } from '@/components/product/ProductGrid';
import { Pagination } from '@/components/product/Pagination';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    title: locale === 'tr' ? 'Mermer Kataloğu' : 'Marble Catalogue',
    description:
      locale === 'tr'
        ? 'Premium mermer ürünlerimizi keşfedin.'
        : 'Explore our premium marble products.',
    alternates: {
      canonical: `${baseUrl}/${locale}/products`,
      languages: {
        tr: `${baseUrl}/tr/products`,
        en: `${baseUrl}/en/products`,
      },
    },
  };
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
  const pageSize = 24;

  let result;
  try {
    result = await getProducts(locale, { page, pageSize });
  } catch {
    notFound();
  }

  const { data: products, meta } = result;

  return (
    <main className="catalogue-page">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Mermerler' : 'Marbles' },
          ]}
        />

        <div className="catalogue-page__header">
          <span
            className="text-label"
            style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
          >
            {locale === 'tr' ? 'Koleksiyon' : 'Collection'}
          </span>
          <h1 className="text-h1">
            {locale === 'tr' ? 'Mermer Kataloğu' : 'Marble Catalogue'}
          </h1>
          <p className="catalogue-page__intro">
            {locale === 'tr'
              ? 'Doğal taş koleksiyonumuzu keşfedin. Her mermer, benzersiz dokusu ve karakteriyle projelerinize değer katar.'
              : 'Explore our natural stone collection. Each marble brings unique texture and character to your projects.'}
          </p>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state__heading">
              {locale === 'tr' ? 'Ürün Bulunamadı' : 'No Products Found'}
            </h2>
            <p className="empty-state__message">
              {locale === 'tr'
                ? 'Şu anda görüntülenecek ürün bulunmamaktadır.'
                : 'There are no products to display at this time.'}
            </p>
            <a href={`/${locale}`} className="button button--secondary button--md">
              {locale === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Homepage'}
            </a>
          </div>
        ) : (
          <>
            <ProductGrid products={products} />
            <Pagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              locale={locale}
            />
          </>
        )}
      </Container>
    </main>
  );
}
