import { withAdminAuth } from '@/lib/auth/admin-handler';
import { ValidationError } from '@/lib/api/errors';
import {
  adminProjectCreateSchema,
  parseQueryInt,
  parseQueryString,
  toValidationDetails,
} from '@/lib/api/validation';
import { listAdminEditorial, createAdminEditorial } from '@/services/adminEditorial';
import type { NextRequest } from 'next/server';

const KIND = 'PROJECT' as const;

// GET /api/v1/admin/projects — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (req: NextRequest) => {
    const url = new URL(req.url);
    return listAdminEditorial(KIND, {
      page: parseQueryInt(url.searchParams.get('page') ?? undefined, 1),
      pageSize: parseQueryInt(url.searchParams.get('pageSize') ?? undefined, 20),
      q: parseQueryString(url.searchParams.get('q') ?? undefined),
    });
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// POST /api/v1/admin/projects — ADMIN, EDITOR
export const POST = withAdminAuth(
  async (req: NextRequest, _ctx, admin) => {
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body', []);
    }
    const parsed = adminProjectCreateSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
    return createAdminEditorial(KIND, parsed.data, admin.id);
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
