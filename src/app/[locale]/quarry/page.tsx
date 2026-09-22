type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function QuarryPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main>
      <h1>{locale === 'tr' ? 'Ocak' : 'Quarry'}</h1>
      <p>{locale === 'tr' ? 'Ocak sayfası yakında burada olacak.' : 'Quarry page will appear here.'}</p>
    </main>
  );
}
