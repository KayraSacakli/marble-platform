import { createApiHandler } from '@/lib/api/handler';
import { parseLocale, parsePagination } from '@/lib/api/validation';
import { contentService } from '@/services/content';

export const GET = createApiHandler(async (req, { params }) => {
  const { locale } = await params;
  const parsed = parseLocale(locale);
  const pagination = parsePagination(new URL(req.url).searchParams);

  const result = await contentService.getJournalList(parsed, pagination);

  return result;
});
