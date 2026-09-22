type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ProjectsPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main>
      <h1>{locale === 'tr' ? 'Projeler' : 'Projects'}</h1>
      <p>{locale === 'tr' ? 'Proje listesi yakında burada olacak.' : 'Project listing will appear here.'}</p>
    </main>
  );
}
