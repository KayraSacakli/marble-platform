type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function JournalDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  return (
    <main>
      <h1>{locale === 'tr' ? 'Makale Detayı' : 'Article Detail'}</h1>
      <p>Slug: {slug}</p>
    </main>
  );
}
