import { type NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { adminProductCreateSchema, parseQueryInt, parseQueryString } from '@/lib/api/validation';
import { ValidationError } from '@/lib/api/errors';
import { listAdminProducts, createAdminProduct } from '@/services/adminProducts';

// GET /api/v1/admin/products — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (req: NextRequest) => {
    const url = new URL(req.url);
    const result = await listAdminProducts({
      page: parseQueryInt(url.searchParams.get('page') ?? undefined, 1),
      pageSize: parseQueryInt(url.searchParams.get('pageSize') ?? undefined, 20),
      q: parseQueryString(url.searchParams.get('q') ?? undefined),
    });
    return result;
  },
  { roles: ['ADMIN', 'EDITOR'] },
);

// POST /api/v1/admin/products — ADMIN, EDITOR
export const POST = withAdminAuth(
  async (req: NextRequest, _ctx, admin) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body', []);
    }
    const parsed = adminProductCreateSchema.safeParse(body);
    if (!parsed.success) {
      const details = Object.entries(parsed.error.flatten().fieldErrors).flatMap(
        ([field, messages]) =>
          (messages ?? []).map((message) => ({ field, code: 'INVALID', message })),
      );
      throw new ValidationError('Validation failed', details);
    }
    return createAdminProduct(parsed.data, admin.id);
  },
  { roles: ['ADMIN', 'EDITOR'] },
);
