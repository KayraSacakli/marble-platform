import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getFactory } from '@/lib/data/company';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  try {
    const factory = await getFactory(locale);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

    return {
      title: factory.name,
      description: factory.description,
      alternates: {
        canonical: `${baseUrl}/${locale}/factory`,
        languages: Object.fromEntries(
          ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${baseUrl}/${l}/factory`])
        ),
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
            <p className="company-hero__description">
              {factory.description}
            </p>
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
