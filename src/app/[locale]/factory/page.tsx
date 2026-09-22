type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FactoryPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main>
      <h1>{locale === 'tr' ? 'Fabrika' : 'Factory'}</h1>
      <p>{locale === 'tr' ? 'Fabrika sayfası yakında burada olacak.' : 'Factory page will appear here.'}</p>
    </main>
  );
}
