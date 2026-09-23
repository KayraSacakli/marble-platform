import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getHomepage } from '@/lib/data/homepage';
import { Homepage } from '@/components/home/Homepage';
import { SITE_URL } from '@/lib/seo/constants';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const title = locale === 'tr' ? 'Mermer Platformu' : 'Marble Platform';
  const description =
    locale === 'tr'
      ? 'Premium Mermer Üretici ve İhracatçısı — Doğal taş koleksiyonlarımızı keşfedin.'
      : 'Premium Marble Manufacturer & Exporter — Explore our natural stone collections.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${locale}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `${SITE_URL}/${locale}`,
      languages: {
        ...Object.fromEntries(
          ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${SITE_URL}/${l}`])
        ),
        'x-default': `${SITE_URL}/tr`,
      },
    },
  };
}

export default async function LocalePage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let data;
  try {
    data = await getHomepage(locale);
  } catch {
    notFound();
  }

  return <Homepage data={data} />;
}
