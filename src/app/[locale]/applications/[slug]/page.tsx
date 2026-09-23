import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getApplication } from '@/lib/data/applications';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { BreadcrumbJsonLd } from '@/components/seo';
import { SITE_URL } from '@/lib/seo/constants';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  try {
    const application = await getApplication(locale, slug);
    const title = application.name;
    const description = application.description || application.seo?.metaDescription;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/${locale}/applications/${application.slug}`,
        type: 'website',
        images: application.coverImage ? [{ url: application.coverImage.src, alt: application.coverImage.alt, width: application.coverImage.width, height: application.coverImage.height }] : [],
      },
      twitter: { card: 'summary_large_image', title, description },
      alternates: {
        canonical: `${SITE_URL}/${locale}/applications/${application.slug}`,
        languages: {
          ...Object.fromEntries(
            ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${SITE_URL}/${l}/applications/${application.slug}`])
          ),
          'x-default': `${SITE_URL}/tr/applications/${application.slug}`,
        },
      },
    };
  } catch {
    return {};
  }
}

export default async function ApplicationDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let application;
  try {
    application = await getApplication(locale, slug);
  } catch {
    notFound();
  }

  return (
    <main className="application-detail">
      <Container size="lg">
        <BreadcrumbJsonLd
          items={[
            { name: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { name: locale === 'tr' ? 'Uygulamalar' : 'Applications', href: `/${locale}/applications` },
            { name: application.name },
          ]}
        />
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Uygulamalar' : 'Applications', href: `/${locale}/applications` },
            { label: application.name },
          ]}
        />

        <div className="application-hero">
          <div className="application-hero__info">
            <h1 className="application-hero__name">{application.name}</h1>

            {application.description && (
              <p className="application-hero__description">{application.description}</p>
            )}
          </div>

          {application.coverImage && (
            <div className="application-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={application.coverImage.src}
                alt={application.coverImage.alt}
                loading="eager"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        {application.products.length > 0 && (
          <section className="application-products">
            <h2 className="application-products__heading">
              {locale === 'tr' ? 'Bu Uygulamada Kullanılan Ürünler' : 'Products Used in This Application'}
            </h2>
            <div className="collection-grid">
              {application.products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 3}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}

        {application.projects.length > 0 && (
          <section className="application-relationships">
            <h2 className="application-relationships__heading">
              {locale === 'tr' ? 'İlgili Projeler' : 'Related Projects'}
            </h2>
            <div className="application-relationships__grid">
              {application.projects.map((project) => (
                <a
                  key={project.id}
                  href={`/${locale}/projects/${project.slug}`}
                  className="relationship-card"
                >
                  <div className="relationship-card__body">
                    <h3 className="relationship-card__name">{project.name}</h3>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        {application.journalArticles.length > 0 && (
          <section className="application-relationships">
            <h2 className="application-relationships__heading">
              {locale === 'tr' ? 'İlgili Yazılar' : 'Related Articles'}
            </h2>
            <div className="application-relationships__grid">
              {application.journalArticles.map((article) => (
                <a
                  key={article.id}
                  href={`/${locale}/journal/${article.slug}`}
                  className="relationship-card"
                >
                  <div className="relationship-card__body">
                    <h3 className="relationship-card__name">{article.name}</h3>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="application-cta">
          <h2 className="application-cta__heading">
            {locale === 'tr' ? 'Bu Uygulama Hakkında Konuşalım' : 'Let\'s Discuss This Application'}
          </h2>
          <p className="application-cta__message">
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
