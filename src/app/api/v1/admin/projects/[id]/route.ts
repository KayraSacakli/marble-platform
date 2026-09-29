import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { adminProjectUpdateSchema, toValidationDetails } from '@/lib/api/validation';
import { getAdminEditorial, updateAdminEditorial, deleteAdminEditorial } from '@/services/adminEditorial';

const KIND = 'PROJECT' as const;
const idParam = z.string().uuid('Invalid project id.');

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

// GET /api/v1/admin/projects/[id] — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req: NextRequest, { params }) => {
    const { id } = await params;
    return getAdminEditorial(KIND, parseId(id));
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// PATCH /api/v1/admin/projects/[id] — ADMIN, EDITOR
export const PATCH = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const parsed = adminProjectUpdateSchema.safeParse(await readJson(req));
    if (!parsed.success) throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
    return updateAdminEditorial(KIND, parseId(id), parsed.data, admin.id);
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// DELETE /api/v1/admin/projects/[id] — ADMIN only
export const DELETE = withAdminAuth(
  async (_req: NextRequest, { params }, admin) => {
    const { id } = await params;
    return deleteAdminEditorial(KIND, parseId(id), admin.id);
  },
  { roles: ['ADMIN'] }
);
