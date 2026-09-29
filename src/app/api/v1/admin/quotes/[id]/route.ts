import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { adminQuoteStateUpdateSchema, toValidationDetails } from '@/lib/api/validation';
import { getAdminQuoteRequest, setAdminQuoteState } from '@/services/adminQuotes';

const idParam = z.string().uuid('Invalid quote request id.');

function parseId(id: string): string {
  const parsed = idParam.safeParse(id);
  if (!parsed.success) throw new BadRequestError('Invalid quote request id.');
  return id;
}

// GET /api/v1/admin/quotes/[id] — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req: NextRequest, { params }) => {
    const { id } = await params;
    return getAdminQuoteRequest(parseId(id));
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// PATCH /api/v1/admin/quotes/[id] — status update only (strict schema).
export const PATCH = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body', []);
    }
    const parsed = adminQuoteStateUpdateSchema.safeParse(body);
    if (!parsed.success) throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
    return setAdminQuoteState(parseId(id), parsed.data.state, admin);
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
