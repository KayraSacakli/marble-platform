type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function JournalPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main>
      <h1>{locale === 'tr' ? 'Dergi' : 'Journal'}</h1>
      <p>{locale === 'tr' ? 'Makale listesi yakında burada olacak.' : 'Article listing will appear here.'}</p>
    </main>
  );
}
