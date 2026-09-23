import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, SUPPORTED_LOCALES, getLocaleDirection } from '@/types/locale';
import { inter, playfairDisplay } from '@/lib/fonts';
import { SkipNavigation } from '@/components/navigation/SkipNavigation';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/navigation/Footer';
import { OrganizationJsonLd, WebSiteJsonLd } from '@/components/seo';
import { SITE_URL, getOGLocale } from '@/lib/seo/constants';
import './globals.css';

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const siteName = locale === 'tr' ? 'Mermer Platformu' : 'Marble Platform';
  const title = locale === 'tr' ? 'Mermer Platformu' : 'Marble Platform';
  const description =
    locale === 'tr'
      ? 'Premium Mermer Üretici ve İhracatçısı'
      : 'Premium Marble Manufacturer & Exporter';

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: title,
      template: `%s | ${siteName}`,
    },
    description,
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        ...Object.fromEntries(
          SUPPORTED_LOCALES.map((l) => [l, `${SITE_URL}/${l}`])
        ),
        'x-default': `${SITE_URL}/tr`,
      },
    },
    openGraph: {
      type: 'website',
      locale: getOGLocale(locale),
      siteName,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const direction = getLocaleDirection(locale);

  return (
    <html lang={locale} dir={direction} className={`${playfairDisplay.variable} ${inter.variable}`}>
      <head>
        <OrganizationJsonLd />
        <WebSiteJsonLd locale={locale} />
      </head>
      <body>
        <SkipNavigation />
        <Header locale={locale} currentPath={`/${locale}`} />
        <main id="main-content" style={{ paddingTop: 'var(--header-height-mobile)' }}>
          {children}
        </main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
