import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import {
  parseQueryInt,
  parseQueryString,
  toValidationDetails,
  adminRelationAttachSchema,
  localeSchema,
} from '@/lib/api/validation';
import type { Locale } from '@/types/locale';
import {
  listAdminTaxonomy,
  createAdminTaxonomy,
  getAdminTaxonomy,
  updateAdminTaxonomy,
  deleteAdminTaxonomy,
  listRelatedProducts,
  attachRelatedProduct,
  detachRelatedProduct,
  type TaxonomyKind,
} from '@/services/adminTaxonomy';
import {
  getContentWorkflow,
  listContentRevisions,
  ensureDraftRevision,
  unpublishContent,
} from '@/services/adminWorkflow';
import { prisma } from '@/lib/prisma';

// Re-exported for route files that need the kind type only.
export type { TaxonomyKind };

// ============================================================
// Shared admin CRUD + relations + workflow routes for
// Collection / Application (same shape, kind-parameterized).
// Each route.ts re-exports the handlers it needs.
// ============================================================

const idParam = z.string().uuid();
const localeParam = localeSchema;

function badId(label: string): never {
  throw new BadRequestError(`Invalid ${label} id.`);
}

export interface TaxonomyRouteOptions {
  kind: TaxonomyKind;
  label: string;
  createSchema: z.ZodTypeAny;
  updateSchema: z.ZodTypeAny;
}

export function buildTaxonomyRoutes(options: TaxonomyRouteOptions) {
  const { kind, label, createSchema, updateSchema } = options;
  const editorRoles = ['ADMIN', 'EDITOR'] as const;

  const parseId = (id: string): string => {
    const parsed = idParam.safeParse(id);
    if (!parsed.success) badId(label);
    return id;
  };

  async function readJson(req: NextRequest): Promise<unknown> {
    try {
      return await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body', []);
    }
  }

  // GET list + POST create
  const LIST = withAdminAuth(
    async (req: NextRequest) => {
      const url = new URL(req.url);
      return listAdminTaxonomy(kind, {
        page: parseQueryInt(url.searchParams.get('page') ?? undefined, 1),
        pageSize: parseQueryInt(url.searchParams.get('pageSize') ?? undefined, 20),
        q: parseQueryString(url.searchParams.get('q') ?? undefined),
      });
    },
    { roles: [...editorRoles] }
  );

  const CREATE = withAdminAuth(
    async (req: NextRequest, _ctx, admin) => {
      const parsed = createSchema.safeParse(await readJson(req));
      if (!parsed.success) throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
      type CreateInput = Parameters<typeof createAdminTaxonomy>[1];
      return createAdminTaxonomy(kind, parsed.data as CreateInput, admin.id);
    },
    { roles: [...editorRoles] }
  );

  // GET detail + PATCH update + DELETE remove
  const DETAIL = withAdminAuth(
    async (_req: NextRequest, { params }) => {
      const { id } = await params;
      return getAdminTaxonomy(kind, parseId(id));
    },
    { roles: [...editorRoles] }
  );

  const UPDATE = withAdminAuth(
    async (req: NextRequest, { params }, admin) => {
      const { id } = await params;
      const parsed = updateSchema.safeParse(await readJson(req));
      if (!parsed.success) throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
      type UpdateInput = Parameters<typeof updateAdminTaxonomy>[2];
      return updateAdminTaxonomy(kind, parseId(id), parsed.data as UpdateInput, admin.id);
    },
    { roles: [...editorRoles] }
  );

  const REMOVE = withAdminAuth(
    async (_req: NextRequest, { params }, admin) => {
      const { id } = await params;
      return deleteAdminTaxonomy(kind, parseId(id), admin.id);
    },
    { roles: ['ADMIN'] }
  );

  // Relations: GET list + POST attach + DELETE detach
  const PRODUCTS = withAdminAuth(
    async (_req: NextRequest, { params }) => {
      const { id } = await params;
      return { products: await listRelatedProducts(kind, parseId(id)) };
    },
    { roles: [...editorRoles] }
  );

  const ATTACH = withAdminAuth(
    async (req: NextRequest, { params }, admin) => {
      const { id } = await params;
      const parsed = adminRelationAttachSchema.safeParse(await readJson(req));
      if (!parsed.success) throw new ValidationError('Validation failed', toValidationDetails(parsed.error));
      return { products: await attachRelatedProduct(kind, parseId(id), parsed.data.productId, admin.id) };
    },
    { roles: [...editorRoles] }
  );

  const DETACH = withAdminAuth(
    async (req: NextRequest, { params }, admin) => {
      const { id } = await params;
      const productId = new URL(req.url).searchParams.get('productId') ?? '';
      const parsed = z.string().uuid('Invalid product id.').safeParse(productId);
      if (!parsed.success) throw new BadRequestError('Invalid product id.');
      return detachRelatedProduct(kind, parseId(id), parsed.data, admin.id);
    },
    { roles: [...editorRoles] }
  );

  // Workflow: GET status
  const WORKFLOW = withAdminAuth(
    async (_req: NextRequest, { params }) => {
      const { id } = await params;
      return getContentWorkflow(parseId(id), kind);
    },
    { roles: [...editorRoles] }
  );

  // Revisions: GET list + POST ensure draft
  const REVISIONS = withAdminAuth(
    async (req: NextRequest, { params }) => {
      const { id } = await params;
      const localeRaw = new URL(req.url).searchParams.get('locale') ?? undefined;
      let locale: Locale | undefined;
      if (localeRaw !== undefined) {
        const parsed = localeParam.safeParse(localeRaw);
        if (!parsed.success) throw new BadRequestError('Invalid locale.');
        locale = parsed.data;
      }
      return { revisions: await listContentRevisions(parseId(id), kind, locale) };
    },
    { roles: [...editorRoles] }
  );

  const NEW_DRAFT = withAdminAuth(
    async (req: NextRequest, { params }, admin) => {
      const { id } = await params;
      const contentId = parseId(id);
      const body = (await readJson(req)) as { locale?: unknown };
      const parsed = localeParam.safeParse(body.locale);
      if (!parsed.success) throw new ValidationError('A valid locale (tr|en) is required.', []);
      const item = await prisma.contentItem.findUnique({
        where: { id: contentId },
        include: { variants: { where: { locale: parsed.data } } },
      });
      if (!item || item.type !== kind || item.variants.length === 0) {
        throw new BadRequestError(`${label} variant not found.`);
      }
      const draft = await ensureDraftRevision(item.variants[0].id, admin.id);
      return { revision: draft, workflow: await getContentWorkflow(contentId, kind) };
    },
    { roles: [...editorRoles] }
  );

  // Unpublish (ADMIN only)
  const UNPUBLISH = withAdminAuth(
    async (req: NextRequest, { params }, admin) => {
      const { id } = await params;
      const body = (await readJson(req)) as { locale?: unknown };
      const parsed = localeParam.safeParse(body.locale);
      if (!parsed.success) throw new ValidationError('A valid locale (tr|en) is required.', []);
      return { workflow: await unpublishContent(parseId(id), kind, parsed.data, admin.id) };
    },
    { roles: ['ADMIN'] }
  );

  return { LIST, CREATE, DETAIL, UPDATE, REMOVE, PRODUCTS, ATTACH, DETACH, WORKFLOW, REVISIONS, NEW_DRAFT, UNPUBLISH };
}
