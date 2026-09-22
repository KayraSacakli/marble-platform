type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function QuotePage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main>
      <h1>{locale === 'tr' ? 'Teklif Talebi' : 'Request Quote'}</h1>
      <p>{locale === 'tr' ? 'Teklif formu yakında burada olacak.' : 'Quote form will appear here.'}</p>
    </main>
  );
}
