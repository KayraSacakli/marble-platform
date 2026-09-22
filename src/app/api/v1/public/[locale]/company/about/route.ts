import { createApiHandler } from '@/lib/api/handler';
import { parseLocale } from '@/lib/api/validation';
import { contentService } from '@/services/content';

export const GET = createApiHandler(async (req, { params }) => {
  const { locale } = await params;
  const parsed = parseLocale(locale);

  const about = await contentService.getCompanyContent('ABOUT', parsed);

  return about;
});
