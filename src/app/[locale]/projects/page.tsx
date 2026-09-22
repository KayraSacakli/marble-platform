import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getProjects } from '@/lib/data/projects';
import { ProjectGrid } from '@/components/project/ProjectGrid';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';

type PageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

  return {
    title: locale === 'tr' ? 'Projeler' : 'Projects',
    description:
      locale === 'tr'
        ? 'Tamamlanmış ve devam eden projelerimizi keşfedin.'
        : 'Explore our completed and ongoing projects.',
    alternates: {
      canonical: `${baseUrl}/${locale}/projects`,
      languages: Object.fromEntries(
        ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${baseUrl}/${l}/projects`])
      ),
    },
  };
}

export default async function ProjectsPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let result;
  try {
    result = await getProjects(locale);
  } catch {
    notFound();
  }

  const { data: projects } = result;

  return (
    <main className="project-page">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Projeler' : 'Projects' },
          ]}
        />

        <div className="project-page__header">
          <span
            className="text-label"
            style={{ color: 'var(--color-text-secondary)', display: 'block', marginBottom: 'var(--space-3)' }}
          >
            {locale === 'tr' ? 'Mimari Portföy' : 'Architectural Portfolio'}
          </span>
          <h1 className="text-h1">
            {locale === 'tr' ? 'Projeler' : 'Projects'}
          </h1>
          <p className="project-page__intro">
            {locale === 'tr'
              ? 'Doğal taşın mimari vizyonla buluştuğu projelerimizi keşfedin.'
              : 'Discover our projects where natural stone meets architectural vision.'}
          </p>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <h2 className="empty-state__heading">
              {locale === 'tr' ? 'Proje Bulunamadı' : 'No Projects Found'}
            </h2>
            <p className="empty-state__message">
              {locale === 'tr'
                ? 'Şu anda görüntülenecek proje bulunmamaktadır.'
                : 'There are no projects to display at this time.'}
            </p>
            <a href={`/${locale}`} className="button button--secondary button--md">
              {locale === 'tr' ? 'Ana Sayfaya Dön' : 'Return to Homepage'}
            </a>
          </div>
        ) : (
          <ProjectGrid projects={projects} />
        )}
      </Container>
    </main>
  );
}
