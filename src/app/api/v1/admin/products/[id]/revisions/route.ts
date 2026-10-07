import { z } from 'zod';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { prisma } from '@/lib/prisma';
import { listProductRevisions, ensureDraftRevision, getProductWorkflow } from '@/services/adminWorkflow';
import { localeSchema } from '@/lib/api/validation';
import type { Locale } from '@/types/locale';

const idParam = z.string().uuid('Invalid product id.');

function parseProductId(id: string): string {
  const parsed = idParam.safeParse(id);
  if (!parsed.success) throw new BadRequestError('Invalid product id.');
  return parsed.data;
}

// GET /api/v1/admin/products/[id]/revisions?locale=tr — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (req, { params }) => {
    const { id } = await params;
    const localeRaw = new URL(req.url).searchParams.get('locale') ?? undefined;
    let locale: Locale | undefined;
    if (localeRaw !== undefined) {
      const parsed = localeSchema.safeParse(localeRaw);
      if (!parsed.success) throw new BadRequestError('Invalid locale.');
      locale = parsed.data;
    }
    return { revisions: await listProductRevisions(parseProductId(id), locale) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// POST /api/v1/admin/products/[id]/revisions { locale } — ensure draft — ADMIN, EDITOR
export const POST = withAdminAuth(
  async (req, { params }, admin) => {
    const { id } = await params;
    const productId = parseProductId(id);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body', []);
    }
    const parsed = localeSchema.safeParse((body as { locale?: unknown })?.locale);
    if (!parsed.success) throw new ValidationError('A valid locale is required.', []);
    const item = await prisma.contentItem.findUnique({
      where: { id: productId },
      include: { variants: { where: { locale: parsed.data } } },
    });
    if (!item || item.type !== 'PRODUCT' || item.variants.length === 0) {
      throw new BadRequestError('Product variant not found.');
    }
    const draft = await ensureDraftRevision(item.variants[0].id, admin.id);
    return { revision: draft, workflow: await getProductWorkflow(productId) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
