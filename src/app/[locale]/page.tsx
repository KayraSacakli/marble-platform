import { notFound } from 'next/navigation';
import { isLocale } from '@/types/locale';
import { getHomepage } from '@/lib/data/homepage';
import { Homepage } from '@/components/home/Homepage';

type PageProps = {
  params: Promise<{ locale: string }>;
};

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
