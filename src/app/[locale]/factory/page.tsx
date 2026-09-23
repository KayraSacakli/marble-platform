import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getFactory } from '@/lib/data/company';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { BreadcrumbJsonLd } from '@/components/seo';
import { SITE_URL } from '@/lib/seo/constants';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  try {
    const factory = await getFactory(locale);
    const title = factory.name;
    const description = factory.description;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url: `${SITE_URL}/${locale}/factory`,
        type: 'website',
        images: factory.coverImage ? [{ url: factory.coverImage.src, alt: factory.coverImage.alt, width: factory.coverImage.width, height: factory.coverImage.height }] : [],
      },
      twitter: { card: 'summary_large_image', title, description },
      alternates: {
        canonical: `${SITE_URL}/${locale}/factory`,
        languages: {
          ...Object.fromEntries(
            ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${SITE_URL}/${l}/factory`])
          ),
          'x-default': `${SITE_URL}/tr/factory`,
        },
      },
    };
  } catch {
    return {};
  }
}

export default async function FactoryPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let factory;
  try {
    factory = await getFactory(locale);
  } catch {
    notFound();
  }

  return (
    <main className="company-page">
      <Container size="lg">
        <BreadcrumbJsonLd
          items={[
            { name: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { name: factory.name },
          ]}
        />
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: factory.name },
          ]}
        />

        <div className="company-page__header">
          <span
            className="text-label"
            style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
          >
            {locale === 'tr' ? 'Üretim Tesisimiz' : 'Our Production Facility'}
          </span>
          <h1 className="text-h1">{factory.name}</h1>
          {factory.description && (
            <p className="company-page__intro">{factory.description}</p>
          )}
        </div>

        <div className="company-hero">
          <div className="company-hero__info">
            <h2 className="company-hero__name" style={{ fontSize: 'var(--text-h2)' }}>
              {locale === 'tr' ? 'Fabrikamız' : 'Our Factory'}
            </h2>
          </div>

          {factory.coverImage && (
            <div className="company-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={factory.coverImage.src}
                alt={factory.coverImage.alt}
                loading="eager"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        {factory.description && (
          <section className="company-content">
            <div
              className="company-content__body"
              dangerouslySetInnerHTML={{ __html: factory.description }}
            />
          </section>
        )}

        <section className="company-cta">
          <h2 className="company-cta__heading">
            {locale === 'tr' ? 'Üretim Hakkında Konuşalım' : "Let's Discuss Production"}
          </h2>
          <p className="company-cta__message">
            {locale === 'tr'
              ? 'Üretim kapasitemiz ve çözümlerimiz hakkında bilgi alın.'
              : 'Learn about our production capacity and solutions.'}
          </p>
          <a href={`/${locale}/contact`} className="button button--primary button--lg">
            {locale === 'tr' ? 'İletişim' : 'Contact Us'}
          </a>
        </section>
      </Container>
    </main>
  );
}
