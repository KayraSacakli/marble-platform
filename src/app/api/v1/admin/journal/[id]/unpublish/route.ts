import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { unpublishContent } from '@/services/adminWorkflow';
import { localeSchema } from '@/lib/api/validation';

const KIND = 'JOURNAL_ARTICLE' as const;

// POST /api/v1/admin/journal/[id]/unpublish { locale } — ADMIN only
export const POST = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const parsedId = z.string().uuid('Invalid journal id.').safeParse(id);
    if (!parsedId.success) throw new BadRequestError('Invalid journal id.');
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body', []);
    }
    const parsedLocale = localeSchema.safeParse((body as { locale?: unknown })?.locale);
    if (!parsedLocale.success) throw new ValidationError('A valid locale is required.', []);
    return { workflow: await unpublishContent(parsedId.data, KIND, parsedLocale.data, admin.id) };
  },
  { roles: ['ADMIN'] }
);
