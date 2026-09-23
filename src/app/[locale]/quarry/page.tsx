import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getQuarry } from '@/lib/data/company';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  try {
    const quarry = await getQuarry(locale);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

    return {
      title: quarry.name,
      description: quarry.description,
      alternates: {
        canonical: `${baseUrl}/${locale}/quarry`,
        languages: Object.fromEntries(
          ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${baseUrl}/${l}/quarry`])
        ),
      },
    };
  } catch {
    return {};
  }
}

export default async function QuarryPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let quarry;
  try {
    quarry = await getQuarry(locale);
  } catch {
    notFound();
  }

  return (
    <main className="company-page">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: quarry.name },
          ]}
        />

        <div className="company-page__header">
          <span
            className="text-label"
            style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
          >
            {locale === 'tr' ? 'Doğal Kaynağımız' : 'Our Natural Source'}
          </span>
          <h1 className="text-h1">{quarry.name}</h1>
          {quarry.description && (
            <p className="company-page__intro">{quarry.description}</p>
          )}
        </div>

        <div className="company-hero">
          <div className="company-hero__info">
            <h2 className="company-hero__name" style={{ fontSize: 'var(--text-h2)' }}>
              {locale === 'tr' ? 'Ocağımızdan' : 'From Our Quarry'}
            </h2>
            <p className="company-hero__description">
              {quarry.description}
            </p>
          </div>

          {quarry.coverImage && (
            <div className="company-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={quarry.coverImage.src}
                alt={quarry.coverImage.alt}
                loading="eager"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        {quarry.description && (
          <section className="company-content">
            <div
              className="company-content__body"
              dangerouslySetInnerHTML={{ __html: quarry.description }}
            />
          </section>
        )}

        <section className="company-cta">
          <h2 className="company-cta__heading">
            {locale === 'tr' ? 'Taş Seçiminde Yardımcı Olalım' : 'Let Us Help with Stone Selection'}
          </h2>
          <p className="company-cta__message">
            {locale === 'tr'
              ? 'Projeleriniz için doğru doğal taşı seçmenize yardımcı olalım.'
              : 'Let us help you choose the right natural stone for your projects.'}
          </p>
          <a href={`/${locale}/quote`} className="button button--primary button--lg">
            {locale === 'tr' ? 'Teklif İste' : 'Request a Quote'}
          </a>
        </section>
      </Container>
    </main>
  );
}
