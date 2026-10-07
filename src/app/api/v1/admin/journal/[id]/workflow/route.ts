import { z } from 'zod';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError } from '@/lib/api/errors';
import { getContentWorkflow } from '@/services/adminWorkflow';

const KIND = 'JOURNAL_ARTICLE' as const;
const idParam = z.string().uuid('Invalid journal id.');

// GET /api/v1/admin/journal/[id]/workflow — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req, { params }) => {
    const { id } = await params;
    const parsed = idParam.safeParse(id);
    if (!parsed.success) throw new BadRequestError('Invalid journal id.');
    return getContentWorkflow(parsed.data, KIND);
  },
  { roles: ['ADMIN', 'EDITOR'] },
);
