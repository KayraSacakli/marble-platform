import { withAdminAuth } from '@/lib/auth/admin-handler';
import {
  adminCompanyContentCreateSchema,
  adminCompanyContentUpdateSchema,
  companyContentKindSchema,
  COMPANY_CONTENT_KINDS,
  toValidationDetails,
} from '@/lib/api/validation';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import {
  getAdminCompanyContent,
  createAdminCompanyContent,
  updateAdminCompanyContent,
} from '@/services/adminCompanyContent';

function parseKind(kind: string) {
  const parsed = companyContentKindSchema.safeParse(kind);
  if (!parsed.success) {
    throw new BadRequestError(
      `Invalid company content kind. Expected one of: ${COMPANY_CONTENT_KINDS.join(', ')}.`,
    );
  }
  return parsed.data;
}

async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    throw new ValidationError('Invalid JSON body', []);
  }
}

// GET /api/v1/admin/company-content/[kind] — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (_req, { params }) => {
    const { kind } = await params;
    return getAdminCompanyContent(parseKind(kind));
  },
  { roles: ['ADMIN', 'EDITOR'] },
);

// POST /api/v1/admin/company-content/[kind] — create — ADMIN, EDITOR
export const POST = withAdminAuth(
  async (req, { params }, admin) => {
    const { kind } = await params;
    const parsed = adminCompanyContentCreateSchema.safeParse(await readJson(req));
    if (!parsed.success) {
      throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
    }
    return createAdminCompanyContent(parseKind(kind), parsed.data, admin.id);
  },
  { roles: ['ADMIN', 'EDITOR'] },
);

// PATCH /api/v1/admin/company-content/[kind] — update drafts — ADMIN, EDITOR
export const PATCH = withAdminAuth(
  async (req, { params }, admin) => {
    const { kind } = await params;
    const parsed = adminCompanyContentUpdateSchema.safeParse(await readJson(req));
    if (!parsed.success) {
      throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
    }
    return updateAdminCompanyContent(parseKind(kind), parsed.data, admin.id);
  },
  { roles: ['ADMIN', 'EDITOR'] },
);
