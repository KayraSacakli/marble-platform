import { z } from 'zod';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { adminProductUpdateSchema } from '@/lib/api/validation';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { getAdminProduct, updateAdminProduct, deleteAdminProduct } from '@/services/adminProducts';

const idParam = z.string().uuid('Invalid product id.');

function parseId(id: string): string {
  const parsed = idParam.safeParse(id);
  if (!parsed.success) {
    throw new BadRequestError('Invalid product id.');
  }
  return parsed.data;
}

function parseBodyError(body: unknown, schema: typeof adminProductUpdateSchema) {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const details = Object.entries(parsed.error.flatten().fieldErrors).flatMap(([field, messages]) =>
      (messages ?? []).map((message) => ({ field, code: 'INVALID', message }))
    );
    throw new ValidationError('Validation failed', details);
  }
  return parsed.data;
}

// GET /api/v1/admin/products/[id] — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req, { params }) => {
    const { id } = await params;
    return getAdminProduct(parseId(id));
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// PATCH /api/v1/admin/products/[id] — ADMIN, EDITOR
export const PATCH = withAdminAuth(
  async (req, { params }, admin) => {
    const { id } = await params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body', []);
    }
    return updateAdminProduct(parseId(id), parseBodyError(body, adminProductUpdateSchema), admin.id);
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// DELETE /api/v1/admin/products/[id] — ADMIN only
export const DELETE = withAdminAuth(
  async (_req, { params }, admin) => {
    const { id } = await params;
    return deleteAdminProduct(parseId(id), admin.id);
  },
  { roles: ['ADMIN'] }
);
