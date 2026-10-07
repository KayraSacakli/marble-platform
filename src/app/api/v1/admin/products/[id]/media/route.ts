import { z } from 'zod';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { adminMediaAttachSchema, adminMediaReorderSchema } from '@/lib/api/validation';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import {
  listProductMedia,
  attachProductMedia,
  detachProductMedia,
  reorderProductMedia,
} from '@/services/adminMedia';

const idParam = z.string().uuid('Invalid product id.');

function parseProductId(id: string): string {
  const parsed = idParam.safeParse(id);
  if (!parsed.success) throw new BadRequestError('Invalid product id.');
  return parsed.data;
}

function invalidBody(): never {
  throw new ValidationError('Invalid JSON body', []);
}

// GET /api/v1/admin/products/[id]/media — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req, { params }) => {
    const { id } = await params;
    return { media: await listProductMedia(parseProductId(id)) };
  },
  { roles: ['ADMIN', 'EDITOR'] },
);

// POST /api/v1/admin/products/[id]/media — attach — ADMIN, EDITOR
export const POST = withAdminAuth(
  async (req, { params }, admin) => {
    const { id } = await params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      invalidBody();
    }
    const parsed = adminMediaAttachSchema.safeParse(body);
    if (!parsed.success) {
      const details = Object.entries(parsed.error.flatten().fieldErrors).flatMap(
        ([field, messages]) =>
          (messages ?? []).map((message) => ({ field, code: 'INVALID', message })),
      );
      throw new ValidationError('Validation failed', details);
    }
    return { media: await attachProductMedia(parseProductId(id), parsed.data, admin.id) };
  },
  { roles: ['ADMIN', 'EDITOR'] },
);

// PATCH /api/v1/admin/products/[id]/media — reorder + alt text — ADMIN, EDITOR
export const PATCH = withAdminAuth(
  async (req, { params }, admin) => {
    const { id } = await params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      invalidBody();
    }
    const parsed = adminMediaReorderSchema.safeParse(body);
    if (!parsed.success) {
      const details = Object.entries(parsed.error.flatten().fieldErrors).flatMap(
        ([field, messages]) =>
          (messages ?? []).map((message) => ({ field, code: 'INVALID', message })),
      );
      throw new ValidationError('Validation failed', details);
    }
    return { media: await reorderProductMedia(parseProductId(id), parsed.data.items, admin.id) };
  },
  { roles: ['ADMIN', 'EDITOR'] },
);

// DELETE /api/v1/admin/products/[id]/media?assetId= — detach — ADMIN, EDITOR
export const DELETE = withAdminAuth(
  async (req, { params }, admin) => {
    const { id } = await params;
    const assetId = new URL(req.url).searchParams.get('assetId') ?? '';
    const parsed = z.string().uuid('Invalid media id.').safeParse(assetId);
    if (!parsed.success) throw new BadRequestError('Invalid media id.');
    return detachProductMedia(parseProductId(id), parsed.data, admin.id);
  },
  { roles: ['ADMIN', 'EDITOR'] },
);
