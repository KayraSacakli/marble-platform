import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale, type Locale } from '@/types/locale';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { QuoteForm } from '@/components/quote/QuoteForm';
import { getProject } from '@/lib/data/projects';
import { getProduct } from '@/lib/data/products';
import { getApplication } from '@/lib/data/applications';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ product?: string; project?: string; application?: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    title: locale === 'tr' ? 'Teklif Talebi' : 'Request a Quote',
    description:
      locale === 'tr'
        ? 'Projeniz için doğal taş teklifi alın. Uzman ekibimiz size yardımcı olmaya hazır.'
        : 'Get a quote for natural stone for your project. Our expert team is ready to help.',
    alternates: {
      canonical: `${baseUrl}/${locale}/quote`,
      languages: Object.fromEntries(
        ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${baseUrl}/${l}/quote`])
      ),
    },
  };
}

async function resolveContext(locale: Locale, searchParams: { product?: string; project?: string; application?: string }) {
  if (searchParams.product) {
    try {
      const product = await getProduct(locale, searchParams.product);
      return { contextKind: 'PRODUCT' as const, name: product.name, id: product.id };
    } catch {
      return null;
    }
  }
  if (searchParams.project) {
    try {
      const project = await getProject(locale, searchParams.project);
      return { contextKind: 'PROJECT' as const, name: project.name, id: project.id };
    } catch {
      return null;
    }
  }
  if (searchParams.application) {
    try {
      const application = await getApplication(locale, searchParams.application);
      return { contextKind: 'APPLICATION' as const, name: application.name, id: application.id };
    } catch {
      return null;
    }
  }
  return null;
}

export default async function QuotePage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  const sp = await searchParams;

  if (!isLocale(locale)) {
    notFound();
  }

  const context = await resolveContext(locale, sp);

  return (
    <main className="quote-page">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Teklif Talebi' : 'Request a Quote' },
          ]}
        />

        <div className="quote-page__header">
          <span
            className="text-label"
            style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
          >
            {locale === 'tr' ? 'Teklif Talebi' : 'Quote Request'}
          </span>
          <h1 className="text-h1">
            {locale === 'tr' ? 'Teklif Talebinde Bulunun' : 'Request a Quote'}
          </h1>
          <p className="quote-page__intro">
            {locale === 'tr'
              ? 'Projeniz için doğal taş çözümleri hakkında teklif alın. Formu doldurun, ekibimiz en kısa sürede sizinle iletişime geçsin.'
              : 'Get a quote for natural stone solutions for your project. Fill out the form and our team will get back to you shortly.'}
          </p>
        </div>

        <div className="quote-layout">
          <QuoteForm locale={locale} context={context ?? undefined} />

          <aside className="quote-aside">
            <div className="quote-aside__section">
              <span className="quote-aside__label">
                {locale === 'tr' ? 'Nasıl Çalışır' : 'How It Works'}
              </span>
              <p className="quote-aside__value">
                {locale === 'tr'
                  ? 'Talebiniz alındıktan sonra uzman ekibimiz projenizi değerlendirir ve size özel teklif hazırlar.'
                  : 'After receiving your request, our expert team evaluates your project and prepares a tailored quote.'}
              </p>
            </div>

            <div className="quote-aside__section">
              <span className="quote-aside__label">
                {locale === 'tr' ? 'Destek' : 'Support'}
              </span>
              <p className="quote-aside__value">
                {locale === 'tr'
                  ? 'Sorularınız için bize ulaşın:'
                  : 'For questions, reach out to us:'}
              </p>
              <p className="quote-aside__value">
                <a href="mailto:hello@example.invalid" style={{ color: 'var(--color-accent)', textDecoration: 'none', borderBottom: '1px solid var(--color-accent)' }}>
                  hello@example.invalid
                </a>
              </p>
            </div>

            <div className="quote-aside__section">
              <span className="quote-aside__label">
                {locale === 'tr' ? 'Hızlı Bağlantılar' : 'Quick Links'}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                <a href={`/${locale}/products`} className="button button--ghost button--sm" style={{ justifyContent: 'flex-start' }}>
                  {locale === 'tr' ? 'Mermerlerimiz' : 'Our Marbles'}
                </a>
                <a href={`/${locale}/collections`} className="button button--ghost button--sm" style={{ justifyContent: 'flex-start' }}>
                  {locale === 'tr' ? 'Koleksiyonlar' : 'Collections'}
                </a>
                <a href={`/${locale}/projects`} className="button button--ghost button--sm" style={{ justifyContent: 'flex-start' }}>
                  {locale === 'tr' ? 'Projelerimiz' : 'Our Projects'}
                </a>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </main>
  );
}
