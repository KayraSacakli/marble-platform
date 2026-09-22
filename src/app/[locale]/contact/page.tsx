type PageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ContactPage({ params }: PageProps) {
  const { locale } = await params;

  return (
    <main>
      <h1>{locale === 'tr' ? 'İletişim' : 'Contact'}</h1>
      <p>{locale === 'tr' ? 'İletişim sayfası yakında burada olacak.' : 'Contact page will appear here.'}</p>
    </main>
  );
}
