import { createApiHandler } from '@/lib/api/handler';
import { parseLocale } from '@/lib/api/validation';
import { contentService } from '@/services/content';

export const GET = createApiHandler(async (req, { params }) => {
  const { locale, slug } = await params;
  const parsed = parseLocale(locale);

  const product = await contentService.getProductDetail(slug, parsed);

  return product;
});
