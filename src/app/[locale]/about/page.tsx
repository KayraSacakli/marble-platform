type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main>
      <h1>{locale === 'tr' ? 'Hakkında' : 'About'}</h1>
      <p>{locale === 'tr' ? 'Hakkında sayfası yakında burada olacak.' : 'About page will appear here.'}</p>
    </main>
  );
}
