import { withAdminAuth } from '@/lib/auth/admin-handler';
import { publishRevision, type ManagedContentType } from '@/services/adminWorkflow';
import { parseRevisionId } from '../_common';

const MANAGED: ManagedContentType[] = [
  'PRODUCT',
  'COLLECTION',
  'APPLICATION',
  'PROJECT',
  'JOURNAL_ARTICLE',
  'COMPANY_CONTENT',
];

// POST /api/v1/admin/revisions/[revId]/publish — ADMIN only
export const POST = withAdminAuth(
  async (_req, { params }, admin) => {
    const { revId } = await params;
    return { workflow: await publishRevision(parseRevisionId(revId), admin.id, MANAGED) };
  },
  { roles: ['ADMIN'] },
);
