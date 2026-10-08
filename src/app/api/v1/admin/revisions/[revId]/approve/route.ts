import { withAdminAuth } from '@/lib/auth/admin-handler';
import { approveRevision, type ManagedContentType } from '@/services/adminWorkflow';
import { parseRevisionId, readJsonBody } from '../_common';

const MANAGED: ManagedContentType[] = [
  'PRODUCT',
  'COLLECTION',
  'APPLICATION',
  'PROJECT',
  'JOURNAL_ARTICLE',
  'COMPANY_CONTENT',
];

// POST /api/v1/admin/revisions/[revId]/approve { notes? } — ADMIN only
export const POST = withAdminAuth(
  async (req, { params }, admin) => {
    const { revId } = await params;
    const body = await readJsonBody(req as Request);
    const notes = typeof body.notes === 'string' ? body.notes : undefined;
    return { revision: await approveRevision(parseRevisionId(revId), admin.id, notes, MANAGED) };
  },
  { roles: ['ADMIN'] },
);
