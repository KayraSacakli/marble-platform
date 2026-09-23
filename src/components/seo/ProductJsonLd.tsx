import { SITE_URL } from '@/lib/seo/constants';

interface ProductJsonLdProps {
  name: string;
  description?: string;
  image?: string;
  url: string;
}

export function ProductJsonLd({ name, description, image, url }: ProductJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    ...(description ? { description } : {}),
    url: `${SITE_URL}${url}`,
    ...(image ? { image: image.startsWith('http') ? image : `${SITE_URL}${image}` } : {}),
    brand: {
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
