import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { unpublishContent } from '@/services/adminWorkflow';
import { localeSchema } from '@/lib/api/validation';

const KIND = 'PROJECT' as const;

// POST /api/v1/admin/projects/[id]/unpublish { locale } — ADMIN only
export const POST = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const parsedId = z.string().uuid('Invalid project id.').safeParse(id);
    if (!parsedId.success) throw new BadRequestError('Invalid project id.');
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
