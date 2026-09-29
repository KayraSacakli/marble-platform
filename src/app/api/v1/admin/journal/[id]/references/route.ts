import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { adminJournalReferenceSchema, toValidationDetails } from '@/lib/api/validation';
import {
  listJournalReferences,
  attachJournalReference,
  detachJournalReference,
} from '@/services/adminEditorial';

const idParam = z.string().uuid('Invalid journal id.');
const refParam = z.string().uuid('Invalid reference id.');

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

// GET /api/v1/admin/journal/[id]/references — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req: NextRequest, { params }) => {
    const { id } = await params;
    return { references: await listJournalReferences(parseId(id)) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// POST /api/v1/admin/journal/[id]/references { targetKind, targetId } — ADMIN, EDITOR
export const POST = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const parsed = adminJournalReferenceSchema.safeParse(await readJson(req));
    if (!parsed.success) throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
    return { references: await attachJournalReference(parseId(id), parsed.data.targetKind, parsed.data.targetId, admin.id) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// DELETE /api/v1/admin/journal/[id]/references?referenceId= — ADMIN, EDITOR
export const DELETE = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const referenceId = new URL(req.url).searchParams.get('referenceId') ?? '';
    const parsed = refParam.safeParse(referenceId);
    if (!parsed.success) throw new BadRequestError('Invalid reference id.');
    return detachJournalReference(parseId(id), parsed.data, admin.id);
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
