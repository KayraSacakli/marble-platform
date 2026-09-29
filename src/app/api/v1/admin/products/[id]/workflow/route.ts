import { z } from 'zod';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError } from '@/lib/api/errors';
import { getProductWorkflow } from '@/services/adminWorkflow';

const idParam = z.string().uuid('Invalid product id.');

// GET /api/v1/admin/products/[id]/workflow — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req, { params }) => {
    const { id } = await params;
    const parsed = idParam.safeParse(id);
    if (!parsed.success) throw new BadRequestError('Invalid product id.');
    return getProductWorkflow(parsed.data);
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
