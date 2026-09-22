import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isLocale, SUPPORTED_LOCALES, getLocaleDirection, getLocaleMetadata } from '@/types/locale';
import { inter, playfairDisplay } from '@/lib/fonts';
import { SkipNavigation } from '@/components/navigation/SkipNavigation';
import { Header } from '@/components/navigation/Header';
import { Footer } from '@/components/navigation/Footer';
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const metadata = getLocaleMetadata(locale);
  const siteName = locale === 'tr' ? 'Mermer Platformu' : 'Marble Platform';

  return {
    title: {
      default: locale === 'tr' ? 'Mermer Platformu' : 'Marble Platform',
      template: `%s | ${locale === 'tr' ? 'Mermer Platformu' : 'Marble Platform'}`,
    },
    description:
      locale === 'tr'
        ? 'Premium Mermer Üretici ve İhracatçısı'
        : 'Premium Marble Manufacturer & Exporter',
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, `${baseUrl}/${l}`])
      ),
    },
    openGraph: {
      type: 'website',
      locale: metadata.code === 'tr' ? 'tr_TR' : metadata.code === 'en' ? 'en_US' : `${metadata.code}_${metadata.code.toUpperCase()}`,
      siteName,
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
