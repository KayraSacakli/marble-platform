import { createApiHandler } from '@/lib/api/handler';
import { parseLocale } from '@/lib/api/validation';
import { contentService } from '@/services/content';

export const GET = createApiHandler(async (req, { params }) => {
  const { locale, slug } = await params;
  const parsed = parseLocale(locale);

  const collection = await contentService.getCollectionDetail(slug, parsed);

  return collection;
});
