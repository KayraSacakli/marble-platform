import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { adminMediaAttachSchema, adminMediaReorderSchema, toValidationDetails } from '@/lib/api/validation';
import {
  listProductMedia,
  attachProductMedia,
  detachProductMedia,
  reorderProductMedia,
} from '@/services/adminMedia';

const TYPES = ['JOURNAL_ARTICLE'] as const;
const idParam = z.string().uuid('Invalid journal id.');

function parseId(id: string): string {
  const parsed = idParam.safeParse(id);
  if (!parsed.success) throw new BadRequestError('Invalid journal id.');
  return parsed.data;
}

async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body', []);
  }
}

// GET /api/v1/admin/journal/[id]/media — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req: NextRequest, { params }) => {
    const { id } = await params;
    return { media: await listProductMedia(parseId(id), [...TYPES]) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// POST /api/v1/admin/journal/[id]/media — ADMIN, EDITOR
export const POST = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const parsed = adminMediaAttachSchema.safeParse(await readJson(req));
    if (!parsed.success) throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
    return { media: await attachProductMedia(parseId(id), parsed.data, admin.id, [...TYPES]) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// PATCH /api/v1/admin/journal/[id]/media — ADMIN, EDITOR
export const PATCH = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const parsed = adminMediaReorderSchema.safeParse(await readJson(req));
    if (!parsed.success) throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
    return { media: await reorderProductMedia(parseId(id), parsed.data.items, admin.id, [...TYPES]) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// DELETE /api/v1/admin/journal/[id]/media?assetId= — ADMIN, EDITOR
export const DELETE = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const assetId = new URL(req.url).searchParams.get('assetId') ?? '';
    const parsed = z.string().uuid('Invalid media id.').safeParse(assetId);
    if (!parsed.success) throw new BadRequestError('Invalid media id.');
    return detachProductMedia(parseId(id), parsed.data, admin.id, [...TYPES]);
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
