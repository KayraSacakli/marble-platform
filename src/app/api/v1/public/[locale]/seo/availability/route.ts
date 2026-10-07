import { createApiHandler } from '@/lib/api/handler';
import { contentService } from '@/services/content';

// GET /api/v1/public/[locale]/seo/availability — public SEO content gates.
// The locale segment only satisfies the shared handler contract; the payload
// describes availability for ALL locales and is identical for every locale.
export const GET = createApiHandler(async () => {
  return contentService.getSeoAvailability();
});
