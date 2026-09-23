import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getAbout } from '@/lib/data/company';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  try {
    const about = await getAbout(locale);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

    return {
      title: about.name,
      description: about.description,
      alternates: {
        canonical: `${baseUrl}/${locale}/about`,
        languages: Object.fromEntries(
          ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${baseUrl}/${l}/about`])
        ),
      },
    };
  } catch {
    return {};
  }
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let about;
  try {
    about = await getAbout(locale);
  } catch {
    notFound();
  }

  return (
    <main className="company-page">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: about.name },
          ]}
        />

        <div className="company-page__header">
          <span
            className="text-label"
            style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
          >
            {locale === 'tr' ? 'Şirketimiz' : 'Our Company'}
          </span>
          <h1 className="text-h1">{about.name}</h1>
          {about.description && (
            <p className="company-page__intro">{about.description}</p>
          )}
        </div>

        <div className="company-hero">
          <div className="company-hero__info">
            <h2 className="company-hero__name" style={{ fontSize: 'var(--text-h2)' }}>
              {locale === 'tr' ? 'Hikayemiz' : 'Our Story'}
            </h2>
            <p className="company-hero__description">
              {about.description}
            </p>
          </div>

          {about.coverImage && (
            <div className="company-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={about.coverImage.src}
                alt={about.coverImage.alt}
                loading="eager"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        {about.description && (
          <section className="company-content">
            <div
              className="company-content__body"
              dangerouslySetInnerHTML={{ __html: about.description }}
            />
          </section>
        )}

        <section className="company-cta">
          <h2 className="company-cta__heading">
            {locale === 'tr' ? 'Bizimle İletişime Geçin' : 'Get in Touch'}
          </h2>
          <p className="company-cta__message">
            {locale === 'tr'
              ? 'Projeleriniz için doğal taş çözümleri hakkında konuşalım.'
              : "Let's discuss natural stone solutions for your projects."}
          </p>
          <a href={`/${locale}/contact`} className="button button--primary button--lg">
            {locale === 'tr' ? 'İletişim' : 'Contact Us'}
          </a>
        </section>
      </Container>
    </main>
  );
}
