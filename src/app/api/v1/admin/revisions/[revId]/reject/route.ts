import { withAdminAuth } from '@/lib/auth/admin-handler';
import { ValidationError } from '@/lib/api/errors';
import { rejectRevision, type ManagedContentType } from '@/services/adminWorkflow';
import { parseRevisionId, readJsonBody } from '../_common';

const MANAGED: ManagedContentType[] = [
  'PRODUCT',
  'COLLECTION',
  'APPLICATION',
  'PROJECT',
  'JOURNAL_ARTICLE',
  'COMPANY_CONTENT',
];

// POST /api/v1/admin/revisions/[revId]/reject { reason } — ADMIN only
export const POST = withAdminAuth(
  async (req, { params }, admin) => {
    const { revId } = await params;
    const body = await readJsonBody(req as Request);
    if (typeof body.reason !== 'string' || body.reason.trim() === '') {
      throw new ValidationError('A rejection reason is required.', [
        { field: 'reason', code: 'INVALID', message: 'Rejection reason is required.' },
      ]);
    }
    return {
      revision: await rejectRevision(parseRevisionId(revId), admin.id, body.reason, MANAGED),
    };
  },
  { roles: ['ADMIN'] },
);
