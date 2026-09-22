type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  return (
    <main>
      <h1>{locale === 'tr' ? 'Proje Detayı' : 'Project Detail'}</h1>
      <p>Slug: {slug}</p>
    </main>
  );
}
