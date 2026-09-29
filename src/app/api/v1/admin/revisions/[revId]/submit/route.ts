import { withAdminAuth } from '@/lib/auth/admin-handler';
import { submitRevision, type ManagedContentType } from '@/services/adminWorkflow';
import { parseRevisionId } from '../_common';

const MANAGED: ManagedContentType[] = ['PRODUCT', 'COLLECTION', 'APPLICATION', 'PROJECT', 'JOURNAL_ARTICLE'];

// POST /api/v1/admin/revisions/[revId]/submit — ADMIN, EDITOR
export const POST = withAdminAuth(
  async (_req, { params }, admin) => {
    const { revId } = await params;
    return { revision: await submitRevision(parseRevisionId(revId), admin.id, MANAGED) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
