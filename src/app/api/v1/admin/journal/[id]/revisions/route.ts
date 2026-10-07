import { z } from 'zod';
import type { NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { BadRequestError, ValidationError } from '@/lib/api/errors';
import { listContentRevisions, ensureDraftRevision, getContentWorkflow } from '@/services/adminWorkflow';
import { prisma } from '@/lib/prisma';
import { localeSchema } from '@/lib/api/validation';
import type { Locale } from '@/types/locale';

const KIND = 'JOURNAL_ARTICLE' as const;
const idParam = z.string().uuid('Invalid journal id.');
const localeParam = localeSchema;

function parseId(id: string): string {
  const parsed = idParam.safeParse(id);
  if (!parsed.success) throw new BadRequestError('Invalid journal id.');
  return parsed.data;
}

// GET /api/v1/admin/journal/[id]/revisions?locale= — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (req: NextRequest, { params }) => {
    const { id } = await params;
    const localeRaw = new URL(req.url).searchParams.get('locale') ?? undefined;
    let locale: Locale | undefined;
    if (localeRaw !== undefined) {
      const parsed = localeParam.safeParse(localeRaw);
      if (!parsed.success) throw new BadRequestError('Invalid locale.');
      locale = parsed.data;
    }
    return { revisions: await listContentRevisions(parseId(id), KIND, locale) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

// POST /api/v1/admin/journal/[id]/revisions { locale } — ADMIN, EDITOR
export const POST = withAdminAuth(
  async (req: NextRequest, { params }, admin) => {
    const { id } = await params;
    const contentId = parseId(id);
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body', []);
    }
    const parsed = localeParam.safeParse((body as { locale?: unknown })?.locale);
    if (!parsed.success) throw new ValidationError('A valid locale is required.', []);
    const item = await prisma.contentItem.findUnique({
      where: { id: contentId },
      include: { variants: { where: { locale: parsed.data } } },
    });
    if (!item || item.type !== KIND || item.variants.length === 0) {
      throw new BadRequestError('Journal variant not found.');
    }
    const draft = await ensureDraftRevision(item.variants[0].id, admin.id);
    return { revision: draft, workflow: await getContentWorkflow(contentId, KIND) };
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
