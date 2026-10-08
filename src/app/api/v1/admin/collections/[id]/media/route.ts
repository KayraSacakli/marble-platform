import { z } from 'zod';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { adminMediaAttachSchema, adminMediaReorderSchema } from '@/lib/api/validation';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import {
  listProductMedia,
  attachProductMedia,
  detachProductMedia,
  reorderProductMedia,
  type ManagedMediaType,
} from '@/services/adminMedia';

const TYPES: ManagedMediaType[] = ['COLLECTION'];
const idParam = z.string().uuid('Invalid collection id.');

function parseCollectionId(id: string): string {
  const parsed = idParam.safeParse(id);
  if (!parsed.success) throw new BadRequestError('Invalid collection id.');
  return parsed.data;
}

function invalidBody(): never {
  throw new ValidationError('Invalid JSON body', []);
}

// GET /api/v1/admin/collections/[id]/media — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req, { params }) => {
    const { id } = await params;
    return { media: await listProductMedia(parseCollectionId(id), TYPES) };
  },
  { roles: ['ADMIN', 'EDITOR'] },
);

// POST /api/v1/admin/collections/[id]/media — attach — ADMIN, EDITOR
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
      throw new ValidationError('Validation failed', [
        ...Object.entries(parsed.error.flatten().fieldErrors).flatMap(([field, messages]) =>
          (messages ?? []).map((message) => ({ field, code: 'INVALID', message })),
        ),
      ]);
    }
    return { media: await attachProductMedia(parseCollectionId(id), parsed.data, admin.id, TYPES) };
  },
  { roles: ['ADMIN', 'EDITOR'] },
);

// PATCH /api/v1/admin/collections/[id]/media — reorder + alt text — ADMIN, EDITOR
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
      throw new ValidationError('Validation failed', [
        ...Object.entries(parsed.error.flatten().fieldErrors).flatMap(([field, messages]) =>
          (messages ?? []).map((message) => ({ field, code: 'INVALID', message })),
        ),
      ]);
    }
    return {
      media: await reorderProductMedia(parseCollectionId(id), parsed.data.items, admin.id, TYPES),
    };
  },
  { roles: ['ADMIN', 'EDITOR'] },
);

// DELETE /api/v1/admin/collections/[id]/media?assetId= — detach — ADMIN, EDITOR
export const DELETE = withAdminAuth(
  async (_req, { params }, admin) => {
    const { id } = await params;
    const assetId = new URL(_req.url).searchParams.get('assetId') ?? '';
    const parsed = z.string().uuid('Invalid media id.').safeParse(assetId);
    if (!parsed.success) throw new BadRequestError('Invalid media id.');
    return detachProductMedia(parseCollectionId(id), parsed.data, admin.id, TYPES);
  },
  { roles: ['ADMIN', 'EDITOR'] },
);
