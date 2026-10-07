import { notFound } from 'next/navigation';
import { notFoundOnlyWhenMissing } from '@/lib/api/page-errors';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getHomepage } from '@/lib/data/homepage';
import { Homepage } from '@/components/home/Homepage';
import { SITE_URL } from '@/lib/seo/constants';
import { anyContentLocales, gatedMetadata, getSeoAvailability } from '@/lib/seo/gates';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
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
    ...gatedMetadata(locale, '', anyContentLocales(await getSeoAvailability())),
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
  } catch (error) {
    notFoundOnlyWhenMissing(error);
  }

  return <Homepage data={data} locale={locale} />;
}
