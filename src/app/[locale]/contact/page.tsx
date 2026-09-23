import type { Metadata } from 'next';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';
import { BreadcrumbJsonLd } from '@/components/seo';
import { SITE_URL } from '@/lib/seo/constants';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  const title = locale === 'tr' ? 'İletişim' : 'Contact';
  const description =
    locale === 'tr'
      ? 'Projeleriniz için doğal taş çözümleri hakkında bizimle iletişime geçin.'
      : 'Contact us for natural stone solutions for your projects.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}/contact`,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    alternates: {
      canonical: `${SITE_URL}/${locale}/contact`,
      languages: {
        ...Object.fromEntries(
          ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${SITE_URL}/${l}/contact`])
        ),
        'x-default': `${SITE_URL}/tr/contact`,
      },
    },
  };
}

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main className="contact-page">
      <Container size="lg">
        <BreadcrumbJsonLd
          items={[
            { name: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { name: locale === 'tr' ? 'İletişim' : 'Contact' },
          ]}
        />
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'İletişim' : 'Contact' },
          ]}
        />

        <div className="contact-page__header">
          <span
            className="text-label"
            style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
          >
            {locale === 'tr' ? 'Bize Ulaşın' : 'Reach Out'}
          </span>
          <h1 className="text-h1">
            {locale === 'tr' ? 'İletişim' : 'Contact'}
          </h1>
          <p className="contact-page__intro">
            {locale === 'tr'
              ? 'Projeleriniz için doğal taş çözümleri hakkında bizimle iletişime geçin.'
              : 'Contact us for natural stone solutions for your projects.'}
          </p>
        </div>

        <div className="contact-layout">
          <div className="contact-info">
            <div className="contact-info__section">
              <span className="contact-info__label">
                {locale === 'tr' ? 'E-posta' : 'Email'}
              </span>
              <p className="contact-info__value">
                <a href="mailto:info@marbleplatform.com">info@marbleplatform.com</a>
              </p>
            </div>

            <div className="contact-info__section">
              <span className="contact-info__label">
                {locale === 'tr' ? 'Telefon' : 'Phone'}
              </span>
              <p className="contact-info__value">
                <a href="tel:+902120000000">+90 (212) 000 00 00</a>
              </p>
            </div>

            <div className="contact-info__section">
              <span className="contact-info__label">
                {locale === 'tr' ? 'Adres' : 'Address'}
              </span>
              <p className="contact-info__value">
                {locale === 'tr'
                  ? 'Mermer Platformu\nİstanbul, Türkiye'
                  : 'Marble Platform\nIstanbul, Turkey'}
              </p>
            </div>

            <div className="contact-info__section">
              <span className="contact-info__label">
                {locale === 'tr' ? 'Çalışma Saatleri' : 'Working Hours'}
              </span>
              <p className="contact-info__value">
                {locale === 'tr'
                  ? 'Pazartesi – Cuma: 09:00 – 18:00'
                  : 'Monday – Friday: 09:00 – 18:00'}
              </p>
            </div>
          </div>

          <div className="contact-cta">
            <h2 className="contact-cta__heading">
              {locale === 'tr' ? 'Teklif Talebinde Bulunun' : 'Request a Quote'}
            </h2>
            <p className="contact-cta__message">
              {locale === 'tr'
                ? 'Projeniz için malzeme seçimi, fiyatlandırma ve teslimat hakkında detaylı bilgi almak için teklif formumuzu doldurun.'
                : 'Fill out our quote form to get detailed information about material selection, pricing, and delivery for your project.'}
            </p>
            <div>
              <a href={`/${locale}/quote`} className="button button--primary button--lg">
                {locale === 'tr' ? 'Teklif Talebi' : 'Request Quote'}
              </a>
            </div>
          </div>
        </div>

        <section className="contact-footer">
          <h2 className="contact-footer__heading">
            {locale === 'tr' ? 'Doğal Taş Çözümleri' : 'Natural Stone Solutions'}
          </h2>
          <p className="contact-footer__message">
            {locale === 'tr'
              ? 'Mimari projeleriniz için premium doğal taş seçeneklerimizi keşfedin.'
              : 'Explore our premium natural stone options for your architectural projects.'}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-4)', justifyContent: 'center' }}>
            <a href={`/${locale}/products`} className="button button--secondary button--md">
              {locale === 'tr' ? 'Mermerleri Keşfet' : 'Explore Marbles'}
            </a>
            <a href={`/${locale}/collections`} className="button button--secondary button--md">
              {locale === 'tr' ? 'Koleksiyonlar' : 'Collections'}
            </a>
          </div>
        </section>
      </Container>
    </main>
  );
}
