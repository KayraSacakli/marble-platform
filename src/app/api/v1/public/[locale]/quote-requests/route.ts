import { createApiHandler } from '@/lib/api/handler';
import { parseLocale, quoteRequestSchema } from '@/lib/api/validation';
import { contentService } from '@/services/content';
import { ValidationError } from '@/lib/api/errors';

export const POST = createApiHandler(async (req, { params }) => {
  const { locale } = await params;
  const parsed = parseLocale(locale);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body', []);
  }

  const result = quoteRequestSchema.safeParse(body);
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const details = Object.entries(fieldErrors).flatMap(([field, messages]) =>
      (messages ?? []).map((message) => ({ field, code: 'INVALID', message }))
    );
    throw new ValidationError('Validation failed', details);
  }

  const quoteRequest = await contentService.createQuoteRequest({
    ...result.data,
    locale: parsed,
  });

  return quoteRequest;
});
