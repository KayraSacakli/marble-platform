import { z } from 'zod';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { unpublishProduct } from '@/services/adminWorkflow';

// POST /api/v1/admin/products/[id]/unpublish { locale } — ADMIN only
export const POST = withAdminAuth(
  async (req, { params }, admin) => {
    const { id } = await params;
    const parsedId = z.string().uuid('Invalid product id.').safeParse(id);
    if (!parsedId.success) throw new BadRequestError('Invalid product id.');
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body', []);
    }
    const parsedLocale = z.enum(['tr', 'en']).safeParse((body as { locale?: unknown })?.locale);
    if (!parsedLocale.success) throw new ValidationError('A valid locale (tr|en) is required.', []);
    return { workflow: await unpublishProduct(parsedId.data, parsedLocale.data, admin.id) };
  },
  { roles: ['ADMIN'] }
);
