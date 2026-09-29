import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { parseQueryInt, parseQueryString } from '@/lib/api/validation';
import { listAdminQuoteRequests } from '@/services/adminQuotes';

// GET /api/v1/admin/quotes — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (req: NextRequest) => {
    const url = new URL(req.url);
    return listAdminQuoteRequests({
      page: parseQueryInt(url.searchParams.get('page') ?? undefined, 1),
      pageSize: parseQueryInt(url.searchParams.get('pageSize') ?? undefined, 20),
      state: parseQueryString(url.searchParams.get('state') ?? undefined),
      q: parseQueryString(url.searchParams.get('q') ?? undefined),
    });
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
