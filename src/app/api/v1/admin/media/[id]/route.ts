import { z } from 'zod';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError } from '@/lib/api/errors';
import { getAdminMedia, deleteAdminMedia } from '@/services/adminMedia';

const idParam = z.string().uuid('Invalid media id.');

// GET /api/v1/admin/media/[id] — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req, { params }) => {
    const { id } = await params;
    const parsed = idParam.safeParse(id);
    if (!parsed.success) throw new BadRequestError('Invalid media id.');
    return getAdminMedia(parsed.data);
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// DELETE /api/v1/admin/media/[id] — ADMIN only
export const DELETE = withAdminAuth(
  async (_req, { params }, admin) => {
    const { id } = await params;
    const parsed = idParam.safeParse(id);
    if (!parsed.success) throw new BadRequestError('Invalid media id.');
    return deleteAdminMedia(parsed.data, admin.id);
  },
  { roles: ['ADMIN'] }
);
