import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getProject } from '@/lib/data/projects';
import { ProductCard } from '@/components/product/ProductCard';
import { Breadcrumb } from '@/components/product/Breadcrumb';
import { Container } from '@/components/ui/Container';

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};

  try {
    const project = await getProject(locale, slug);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

    return {
      title: project.name,
      description: project.description || project.seo?.metaDescription,
      alternates: {
        canonical: `${baseUrl}/${locale}/projects/${project.slug}`,
        languages: Object.fromEntries(
          ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${baseUrl}/${l}/projects/${project.slug}`])
        ),
      },
    };
  } catch {
    return {};
  }
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let project;
  try {
    project = await getProject(locale, slug);
  } catch {
    notFound();
  }

  return (
    <main className="project-detail">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Projeler' : 'Projects', href: `/${locale}/projects` },
            { label: project.name },
          ]}
        />

        <div className="project-hero">
          <div className="project-hero__info">
            <h1 className="project-hero__name">{project.name}</h1>

            {(project.location || project.projectType) && (
              <div className="project-hero__meta">
                {project.projectType && (
                  <span className="project-hero__type">{project.projectType}</span>
                )}
                {project.location && (
                  <span className="project-hero__location">{project.location}</span>
                )}
              </div>
            )}

            {project.description && (
              <p className="project-hero__description">{project.description}</p>
            )}
          </div>

          {project.heroImage && (
            <div className="project-hero__media">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={project.heroImage.src}
                alt={project.heroImage.alt}
                loading="eager"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>

        {project.description && (
          <section className="project-description">
            <div
              className="project-description__content"
              dangerouslySetInnerHTML={{ __html: project.description }}
            />
          </section>
        )}

        {project.gallery.length > 0 && (
          <section className="project-gallery">
            <h2 className="project-gallery__heading">
              {locale === 'tr' ? 'Galeri' : 'Gallery'}
            </h2>
            <div className="project-gallery__grid">
              {project.gallery.map((image) => (
                <div key={image.id} className="project-gallery__item">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt}
                    loading="lazy"
                    decoding="async"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {project.products.length > 0 && (
          <section className="project-products">
            <h2 className="project-products__heading">
              {locale === 'tr' ? 'Kullanılan Ürünler' : 'Products Used'}
            </h2>
            <div className="collection-grid">
              {project.products.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 3}
                />
              ))}
            </div>
          </section>
        )}

        {project.applications.length > 0 && (
          <section className="project-relationships">
            <h2 className="project-relationships__heading">
              {locale === 'tr' ? 'İlgili Uygulamalar' : 'Related Applications'}
            </h2>
            <div className="project-relationships__grid">
              {project.applications.map((app) => (
                <a
                  key={app.id}
                  href={`/${locale}/applications/${app.slug}`}
                  className="relationship-card"
                >
                  <div className="relationship-card__body">
                    <h3 className="relationship-card__name">{app.name}</h3>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}

        <section className="project-cta">
          <h2 className="project-cta__heading">
            {locale === 'tr' ? 'Bu Proje Hakkında Konuşalım' : 'Let\'s Discuss This Project'}
          </h2>
          <p className="project-cta__message">
            {locale === 'tr'
              ? 'Benzer bir proje için doğru malzemeyi seçmenize yardımcı olalım.'
              : 'Let us help you choose the right material for a similar project.'}
          </p>
          <a href={`/${locale}/quote`} className="button button--primary button--lg">
            {locale === 'tr' ? 'Teklif İste' : 'Request a Quote'}
          </a>
        </section>
      </Container>
    </main>
  );
}
