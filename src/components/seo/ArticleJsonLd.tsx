import { SITE_URL } from '@/lib/seo/constants';

interface ArticleJsonLdProps {
  headline: string;
  description?: string;
  image?: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  authorName?: string;
}

export function ArticleJsonLd({
  headline,
  description,
  image,
  url,
  datePublished,
  dateModified,
  authorName,
}: ArticleJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline,
    ...(description ? { description } : {}),
    url: `${SITE_URL}${url}`,
    ...(image ? { image: image.startsWith('http') ? image : `${SITE_URL}${image}` } : {}),
    datePublished,
    ...(dateModified ? { dateModified } : {}),
    ...(authorName
      ? {
          author: {
            '@type': 'Organization',
            name: authorName,
          },
        }
      : {}),
    publisher: {
      '@type': 'Organization',
      name: 'Premium Turkish Marble',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
