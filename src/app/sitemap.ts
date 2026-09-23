import type { MetadataRoute } from 'next';
import { SUPPORTED_LOCALES } from '@/types/locale';
import { SITE_URL } from '@/lib/seo/constants';

const STATIC_PATHS = [
  '',
  '/products',
  '/collections',
  '/applications',
  '/projects',
  '/journal',
  '/about',
  '/quarry',
  '/factory',
  '/contact',
  '/quote',
];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const path of STATIC_PATHS) {
      entries.push({
        url: `${SITE_URL}/${locale}${path}`,
        lastModified: new Date(),
        changeFrequency: path === '' ? 'weekly' : 'monthly',
        priority: path === '' ? 1.0 : path === '/products' ? 0.9 : 0.7,
      });
    }
  }

  return entries;
}
