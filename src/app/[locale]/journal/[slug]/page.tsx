import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { isLocale } from '@/types/locale';
import { getJournalArticle } from '@/lib/data/journal';
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
    const article = await getJournalArticle(locale, slug);
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';

    return {
      title: article.title,
      description: article.summary || article.seo?.metaDescription,
      alternates: {
        canonical: `${baseUrl}/${locale}/journal/${article.slug}`,
        languages: Object.fromEntries(
          ['tr', 'en', 'es', 'fr', 'de', 'it', 'ar'].map((l) => [l, `${baseUrl}/${l}/journal/${article.slug}`])
        ),
      },
    };
  } catch {
    return {};
  }
}

export default async function JournalDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  let article;
  try {
    article = await getJournalArticle(locale, slug);
  } catch {
    notFound();
  }

  return (
    <main className="journal-detail">
      <Container size="lg">
        <Breadcrumb
          items={[
            { label: locale === 'tr' ? 'Ana Sayfa' : 'Home', href: `/${locale}` },
            { label: locale === 'tr' ? 'Dergi' : 'Journal', href: `/${locale}/journal` },
            { label: article.title },
          ]}
        />

        <article className="journal-article">
          <header className="journal-article__header">
            <div className="journal-article__meta">
              {article.publicationDate && (
                <time className="journal-article__date" dateTime={article.publicationDate}>
                  {new Date(article.publicationDate).toLocaleDateString(locale === 'tr' ? 'tr-TR' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              )}
              {article.author && (
                <span className="journal-article__author">{article.author}</span>
              )}
            </div>

            <h1 className="journal-article__title">{article.title}</h1>

            {article.summary && (
              <p className="journal-article__summary">{article.summary}</p>
            )}
          </header>

          {article.coverImage && (
            <div className="journal-article__hero">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={article.coverImage.src}
                alt={article.coverImage.alt}
                loading="eager"
                decoding="async"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}

          {article.body && (
            <div
              className="journal-article__content"
              dangerouslySetInnerHTML={{ __html: article.body }}
            />
          )}

          {article.relatedProducts.length > 0 && (
            <section className="journal-article__products">
              <h2 className="journal-article__products-heading">
                {locale === 'tr' ? 'İlgili Ürünler' : 'Related Products'}
              </h2>
              <div className="collection-grid">
                {article.relatedProducts.map((product, index) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priority={index < 3}
                  />
                ))}
              </div>
            </section>
          )}

          {article.relatedProjects.length > 0 && (
            <section className="journal-article__relationships">
              <h2 className="journal-article__relationships-heading">
                {locale === 'tr' ? 'İlgili Projeler' : 'Related Projects'}
              </h2>
              <div className="journal-article__relationships-grid">
                {article.relatedProjects.map((project) => (
                  <a
                    key={project.id}
                    href={`/${locale}/projects/${project.slug}`}
                    className="relationship-card"
                  >
                    <div className="relationship-card__body">
                      <h3 className="relationship-card__name">{project.name}</h3>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {article.relatedArticles.length > 0 && (
            <section className="journal-article__related-articles">
              <h2 className="journal-article__related-articles-heading">
                {locale === 'tr' ? 'Benzer Yazılar' : 'Related Articles'}
              </h2>
              <div className="journal-article__related-articles-grid">
                {article.relatedArticles.map((related) => (
                  <a
                    key={related.id}
                    href={`/${locale}/journal/${related.slug}`}
                    className="relationship-card"
                  >
                    <div className="relationship-card__body">
                      <h3 className="relationship-card__name">{related.name}</h3>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}
        </article>

        <section className="journal-cta">
          <h2 className="journal-cta__heading">
            {locale === 'tr' ? 'Projeniz İçin Teklif Alın' : 'Get a Quote for Your Project'}
          </h2>
          <p className="journal-cta__message">
            {locale === 'tr'
              ? 'Doğal taş seçiminde uzman görüşüne mi ihtiyacınız var?'
              : 'Need expert advice on natural stone selection?'}
          </p>
          <a href={`/${locale}/quote`} className="button button--primary button--lg">
            {locale === 'tr' ? 'Teklif İste' : 'Request a Quote'}
          </a>
        </section>
      </Container>
    </main>
  );
}
