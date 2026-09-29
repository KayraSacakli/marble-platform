import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { listProjectRelations, attachProjectRelation, detachProjectRelation } from '@/services/adminEditorial';

const idParam = z.string().uuid('Invalid project id.');
const targetParam = z.string().uuid('Invalid product id.');

function parseId(id: string): string {
  const parsed = idParam.safeParse(id);
  if (!parsed.success) throw new BadRequestError('Invalid project id.');
  return parsed.data;
}

async function readJson(req: NextRequest): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body', []);
  }
}

// GET /api/v1/admin/projects/[id]/products — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req: NextRequest, { params }) => {
    const { id } = await params;
    return { items: await listProjectRelations('products', parseId(id)) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// POST /api/v1/admin/projects/[id]/products { productId } — ADMIN, EDITOR
export const POST = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const body = (await readJson(req)) as { productId?: unknown };
    const parsed = targetParam.safeParse(body.productId);
    if (!parsed.success) throw new BadRequestError('Invalid product id.');
    return { items: await attachProjectRelation('products', parseId(id), parsed.data, admin.id) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// DELETE /api/v1/admin/projects/[id]/products?productId= — ADMIN, EDITOR
export const DELETE = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const targetId = new URL(req.url).searchParams.get('productId') ?? '';
    const parsed = targetParam.safeParse(targetId);
    if (!parsed.success) throw new BadRequestError('Invalid product id.');
    return detachProjectRelation('products', parseId(id), parsed.data, admin.id);
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
