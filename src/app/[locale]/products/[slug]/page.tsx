import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getProduct } from '@/lib/data/products';
import { ProductGallery } from '@/components/product/ProductGallery';
import { RelatedContent } from '@/components/product/RelatedContent';
import { RelatedProducts } from '@/components/product/RelatedProducts';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { BreadcrumbJsonLd, ProductJsonLd } from '@/components/seo';
import { SITE_URL } from '@/lib/seo/constants';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  try {
    const product = await getProduct(locale, slug);
    const title = product.name;
    const description = product.tagline || product.seo?.metaDescription;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/${locale}/products/${product.slug}`,
        type: 'website',
        images: product.primaryImage ? [{ url: product.primaryImage.src, alt: product.primaryImage.alt, width: product.primaryImage.width, height: product.primaryImage.height }] : [],
      },
      twitter: { card: 'summary_large_image', title, description },
      alternates: {
        canonical: `${SITE_URL}/${locale}/products/${product.slug}`,
        languages: {
          ...Object.fromEntries(
            ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${SITE_URL}/${l}/products/${product.slug}`])
          ),
          'x-default': `${SITE_URL}/tr/products/${product.slug}`,
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
        <BreadcrumbJsonLd
          items={[
            { name: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { name: locale === 'tr' ? 'Mermerler' : 'Marbles', href: `/${locale}/products` },
            { name: product.name },
          ]}
        />
        <ProductJsonLd
          name={product.name}
          description={product.tagline || undefined}
          image={product.primaryImage?.src}
          url={`/${locale}/products/${product.slug}`}
        />
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
