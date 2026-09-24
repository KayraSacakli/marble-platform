import { withAdminAuth } from '@/lib/auth/admin-handler';

// GET /api/v1/admin/auth/me — returns the current session user (401 otherwise).
export const GET = withAdminAuth(async (_req, _ctx, admin) => {
  return { user: admin };
});
