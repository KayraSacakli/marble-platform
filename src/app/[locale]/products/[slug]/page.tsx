import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getProduct } from '@/lib/data/products';
import { ProductGallery } from '@/components/product/ProductGallery';
import { RelatedContent } from '@/components/product/RelatedContent';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  try {
    const product = await getProduct(locale, slug);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

    return {
      title: product.name,
      description: product.tagline || product.seo?.metaDescription,
      alternates: {
        canonical: `${baseUrl}/${locale}/products/${product.slug}`,
        languages: {
          tr: `${baseUrl}/tr/products/${product.slug}`,
          en: `${baseUrl}/en/products/${product.slug}`,
        },
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let product;
  try {
    product = await getProduct(locale, slug);
  } catch {
    notFound();
  }

  return (
    <main className="product-detail">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Mermerler' : 'Marbles', href: `/${locale}/products` },
            { label: product.name },
          ]}
        />

        <div className="product-hero">
          <ProductGallery
            primaryImage={product.primaryImage}
            gallery={product.gallery}
            productName={product.name}
          />

          <div className="product-hero__info">
            <h1 className="product-hero__name">{product.name}</h1>

            {product.tagline && (
              <p className="product-hero__tagline">{product.tagline}</p>
            )}

            <div className="product-hero__cta">
              <a href={`/quote?product=${product.quoteContextIdentifier}`} className="button button--primary button--lg">
                {locale === 'tr' ? 'Teklif İste' : 'Request a Quote'}
              </a>
            </div>
          </div>
        </div>

        {product.description && (
          <section className="product-description">
            <div
              className="product-description__content"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </section>
        )}

        <section className="product-relationships">
          <RelatedContent
            title={locale === 'tr' ? 'İlgili Koleksiyonlar' : 'Related Collections'}
            items={product.collections}
            basePath={`${locale}/collections`}
          />

          <RelatedContent
            title={locale === 'tr' ? 'İlgili Uygulamalar' : 'Related Applications'}
            items={product.applications}
            basePath={`${locale}/applications`}
          />

          <RelatedContent
            title={locale === 'tr' ? 'İlgili Projeler' : 'Related Projects'}
            items={product.projects}
            basePath={`${locale}/projects`}
          />

          <RelatedProducts products={product.relatedProducts} />
        </section>

        <section className="product-quote-cta">
          <h2 className="product-quote-cta__heading">
            {locale === 'tr' ? 'Bu Ürün Hakkında Konuşalım' : 'Let\'s Discuss This Product'}
          </h2>
          <p className="product-quote-cta__message">
            {locale === 'tr'
              ? 'Projeniz için doğru malzemeyi seçmenize yardımcı olalım.'
              : 'Let us help you choose the right material for your project.'}
          </p>
          <a href={`/quote?product=${product.quoteContextIdentifier}`} className="button button--primary button--lg">
            {locale === 'tr' ? 'Teklif İste' : 'Request a Quote'}
          </a>
        </section>
      </Container>
    </main>
  );
}
