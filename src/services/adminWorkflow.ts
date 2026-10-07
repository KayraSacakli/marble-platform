import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/api/errors';
import { writeAudit } from '@/services/adminAudit';
import type { SeoRobotsValue } from '@/lib/api/validation';
import { SUPPORTED_LOCALES, type Locale } from '@/types/locale';

// ============================================================
// Admin publishing / review workflow (products, per locale)
//
// Draft edits live in ContentRevision.materialSnapshot and never touch
// the published ContentVariant row until an APPROVED revision is
// published. Public reads only ever see PUBLISHED variants.
//
// State machine per revision:
//   DRAFT → IN_REVIEW → APPROVED → PUBLISHED
//   IN_REVIEW → REJECTED → (new DRAFT via edit)
// Only ADMIN can approve / reject / publish / unpublish.
// ============================================================

export type RevisionStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED';

const OPEN_STATUSES: RevisionStatus[] = ['DRAFT', 'IN_REVIEW', 'APPROVED'];

export interface DraftSnapshot {
  slug?: string;
  name?: string;
  description?: string | null;
  tagline?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  seoCanonical?: string | null;
  seoRobots?: SeoRobotsValue | null;
  isFeatured?: boolean;
  featuredOrder?: number | null;
  displayOrder?: number | null;
  // Type-specific extension payloads (only the matching key is applied).
  product?: {
    internalIdentifier?: string | null;
    surfaceFinish?: string | null;
    dimensions?: string | null;
    format?: string | null;
    origin?: string | null;
    applicableStandards?: string | null;
  };
  project?: {
    location?: string | null;
    projectType?: string | null;
  };
  journal?: {
    publicationDate?: string | null;
    authorName?: string | null;
  };
}

export interface WorkflowRevision {
  id: string;
  revisionNumber: number;
  status: RevisionStatus;
  authorEmail: string | null;
  createdAt: string;
  approvals: Array<{
    outcome: string;
    approverEmail: string | null;
    notes: string | null;
    coveredLocale: string;
    createdAt: string;
  }>;
}

export interface LocaleWorkflow {
  locale: Locale;
  lifecycleState: string;
  openRevision: WorkflowRevision | null;
  publishedRevisionNumber: number | null;
}

function toWorkflowRevision(revision: {
  id: string;
  revisionNumber: number;
  status: string;
  createdAt: Date;
  author: { email: string } | null;
  approvals: Array<{
    outcome: string;
    notes: string | null;
    coveredLocale: string;
    createdAt: Date;
    approver: { email: string } | null;
  }>;
}): WorkflowRevision {
  return {
    id: revision.id,
    revisionNumber: revision.revisionNumber,
    status: revision.status as RevisionStatus,
    authorEmail: revision.author?.email ?? null,
    createdAt: revision.createdAt.toISOString(),
    approvals: revision.approvals.map((a) => ({
      outcome: a.outcome,
      approverEmail: a.approver?.email ?? null,
      notes: a.notes,
      coveredLocale: a.coveredLocale,
      createdAt: a.createdAt.toISOString(),
    })),
  };
}

const revisionInclude = {
  author: { select: { email: true } },
  approvals: {
    include: { approver: { select: { email: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
};

/** Content types manageable through the admin workflow. */
export type ManagedContentType = 'PRODUCT' | 'COLLECTION' | 'APPLICATION' | 'PROJECT' | 'JOURNAL_ARTICLE';

async function findRevisionOrThrow(id: string, allowedTypes: ManagedContentType[] = ['PRODUCT']) {
  const revision = await prisma.contentRevision.findUnique({
    where: { id },
    include: {
      ...revisionInclude,
      contentVariant: {
        select: {
          id: true,
          locale: true,
          lifecycleState: true,
          contentItemId: true,
          contentItem: { select: { type: true, aggregateState: true } },
        },
      },
    },
  });
  if (!revision || !allowedTypes.includes(revision.contentVariant.contentItem.type as ManagedContentType)) {
    throw new NotFoundError('Revision not found.');
  }
  return revision;
}

async function isLatestRevision(variantId: string, revisionId: string, revisionNumber: number): Promise<boolean> {
  const newer = await prisma.contentRevision.findFirst({
    where: { contentVariantId: variantId, revisionNumber: { gt: revisionNumber } },
    select: { id: true },
  });
  return !newer || newer.id === revisionId;
}

async function requireLatest(revision: { contentVariantId: string; id: string; revisionNumber: number }): Promise<void> {
  if (!(await isLatestRevision(revision.contentVariantId, revision.id, revision.revisionNumber))) {
    throw new ConflictError('A newer revision exists. Refresh and review the latest revision.');
  }
}

export function parseSnapshot(raw: string | null): DraftSnapshot {
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as DraftSnapshot;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

/** Snapshot the current variant (+ type-specific extension) into a JSON draft. */
export function snapshotFromVariant(
  variant: {
    slug: string;
    name: string | null;
    description: string | null;
    tagline: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    seoCanonical: string | null;
    seoRobots?: SeoRobotsValue | null;
    isFeatured: boolean;
    featuredOrder: number | null;
    displayOrder: number | null;
  },
  ext: {
    product?: {
      internalIdentifier: string | null;
      surfaceFinish: string | null;
      dimensions: string | null;
      format: string | null;
      origin: string | null;
      applicableStandards: string | null;
    } | null;
    project?: {
      location: string | null;
      projectType: string | null;
    } | null;
    journal?: {
      publicationDate: Date | null;
      authorName: string | null;
    } | null;
  } | null = null
): DraftSnapshot {
  return {
    slug: variant.slug,
    name: variant.name ?? '',
    description: variant.description,
    tagline: variant.tagline,
    seoTitle: variant.seoTitle,
    seoDescription: variant.seoDescription,
    seoCanonical: variant.seoCanonical,
    seoRobots: variant.seoRobots ?? null,
    isFeatured: variant.isFeatured,
    featuredOrder: variant.featuredOrder,
    displayOrder: variant.displayOrder,
    product: ext?.product
      ? {
          internalIdentifier: ext.product.internalIdentifier,
          surfaceFinish: ext.product.surfaceFinish,
          dimensions: ext.product.dimensions,
          format: ext.product.format,
          origin: ext.product.origin,
          applicableStandards: ext.product.applicableStandards,
        }
      : undefined,
    project: ext?.project
      ? { location: ext.project.location, projectType: ext.project.projectType }
      : undefined,
    journal: ext?.journal
      ? {
          publicationDate: ext.journal.publicationDate ? ext.journal.publicationDate.toISOString() : null,
          authorName: ext.journal.authorName,
        }
      : undefined,
  };
}

async function nextRevisionNumber(variantId: string): Promise<number> {
  const latest = await prisma.contentRevision.findFirst({
    where: { contentVariantId: variantId },
    orderBy: { revisionNumber: 'desc' },
    select: { revisionNumber: true },
  });
  return (latest?.revisionNumber ?? 0) + 1;
}

export async function findOpenRevision(variantId: string) {
  return prisma.contentRevision.findFirst({
    where: { contentVariantId: variantId, status: { in: OPEN_STATUSES } },
    orderBy: { revisionNumber: 'desc' },
    include: revisionInclude,
  });
}

/**
 * Ensure an editable DRAFT revision for a variant. Creates one snapshotted
 * from the variant when none is open. Throws 409 when a revision is already
 * submitted/approved (must be decided first).
 */
export async function ensureDraftRevision(variantId: string, actorId: string) {
  const open = await findOpenRevision(variantId);
  if (open) {
    if (open.status !== 'DRAFT') {
      throw new ConflictError(`Revision #${open.revisionNumber} is ${open.status}. Resolve it before editing.`);
    }
    return open;
  }
  const variant = await prisma.contentVariant.findUnique({
    where: { id: variantId },
    include: { contentItem: { include: { product: true, project: true, journalArticle: true } } },
  });
  if (!variant) {
    throw new NotFoundError('Variant not found.');
  }
  const created = await prisma.contentRevision.create({
    data: {
      contentVariantId: variantId,
      authorId: actorId,
      revisionNumber: await nextRevisionNumber(variantId),
      status: 'DRAFT',
      materialSnapshot: JSON.stringify(
        snapshotFromVariant(variant, {
          product: variant.contentItem.product,
          project: variant.contentItem.project,
          journal: variant.contentItem.journalArticle,
        })
      ),
    },
    include: revisionInclude,
  });
  await writeAudit(actorId, 'CONTENT_REVISION_CREATE', variant.contentItemId, {
    variantId,
    revisionId: created.id,
    revisionNumber: created.revisionNumber,
    locale: variant.locale,
  });
  return created;
}

/** Merge a field patch into an open DRAFT revision snapshot. */
export async function patchDraftSnapshot(
  revisionId: string,
  patch: DraftSnapshot,
  actorId: string,
  allowedTypes: ManagedContentType[] = ['PRODUCT']
): Promise<void> {
  const revision = await findRevisionOrThrow(revisionId, allowedTypes);
  if (revision.status !== 'DRAFT') {
    throw new ConflictError('Only DRAFT revisions can be edited.');
  }
  await requireLatest(revision);
  const merged: DraftSnapshot = { ...parseSnapshot(revision.materialSnapshot) };
  for (const [key, value] of Object.entries(patch)) {
    if (value !== undefined) {
      (merged as Record<string, unknown>)[key] = value;
    }
  }
  if (patch.product) {
    merged.product = { ...(merged.product ?? {}), ...patch.product };
  }
  if (patch.project) {
    merged.project = { ...(merged.project ?? {}), ...patch.project };
  }
  if (patch.journal) {
    merged.journal = { ...(merged.journal ?? {}), ...patch.journal };
  }
  await prisma.contentRevision.update({
    where: { id: revisionId },
    data: { materialSnapshot: JSON.stringify(merged), authorId: actorId },
  });
}

export async function submitRevision(revisionId: string, actorId: string, allowedTypes: ManagedContentType[] = ['PRODUCT']) {
  const revision = await findRevisionOrThrow(revisionId, allowedTypes);
  if (revision.status !== 'DRAFT') {
    throw new ConflictError(`Only DRAFT revisions can be submitted (current: ${revision.status}).`);
  }
  await requireLatest(revision);
  const snapshot = parseSnapshot(revision.materialSnapshot);
  if (!snapshot.slug || !snapshot.name) {
    throw new ValidationError('Draft needs a slug and a name before review.', []);
  }
  const updated = await prisma.contentRevision.update({
    where: { id: revisionId },
    data: { status: 'IN_REVIEW' },
    include: revisionInclude,
  });
  await writeAudit(actorId, 'CONTENT_SUBMIT_REVIEW', revision.contentVariant.contentItemId, {
    revisionId,
    revisionNumber: revision.revisionNumber,
    locale: revision.contentVariant.locale,
  });
  return toWorkflowRevision(updated);
}

export async function approveRevision(revisionId: string, actorId: string, notes?: string, allowedTypes: ManagedContentType[] = ['PRODUCT']) {
  const revision = await findRevisionOrThrow(revisionId, allowedTypes);
  if (revision.status !== 'IN_REVIEW') {
    throw new ConflictError(`Only IN_REVIEW revisions can be approved (current: ${revision.status}).`);
  }
  await requireLatest(revision);
  const attachments = await prisma.contentMedia.findMany({
    where: { contentVariantId: revision.contentVariantId },
    select: { mediaAssetId: true },
  });
  const [updated] = await prisma.$transaction([
    prisma.contentRevision.update({
      where: { id: revisionId },
      data: { status: 'APPROVED' },
      include: revisionInclude,
    }),
    prisma.approval.create({
      data: {
        contentRevisionId: revisionId,
        approverId: actorId,
        outcome: 'APPROVED',
        notes: notes?.trim() ? notes.trim() : null,
        coveredLocale: revision.contentVariant.locale,
        coveredAssets: JSON.stringify(attachments.map((a) => a.mediaAssetId)),
      },
    }),
  ]);
  await writeAudit(actorId, 'CONTENT_APPROVE', revision.contentVariant.contentItemId, {
    revisionId,
    revisionNumber: revision.revisionNumber,
    locale: revision.contentVariant.locale,
  });
  return toWorkflowRevision(updated);
}

export async function rejectRevision(revisionId: string, actorId: string, reason: string, allowedTypes: ManagedContentType[] = ['PRODUCT']) {
  if (!reason.trim()) {
    throw new ValidationError('A rejection reason is required.', [
      { field: 'reason', code: 'INVALID', message: 'Rejection reason is required.' },
    ]);
  }
  const revision = await findRevisionOrThrow(revisionId, allowedTypes);
  if (revision.status !== 'IN_REVIEW') {
    throw new ConflictError(`Only IN_REVIEW revisions can be rejected (current: ${revision.status}).`);
  }
  await requireLatest(revision);
  const [updated] = await prisma.$transaction([
    prisma.contentRevision.update({
      where: { id: revisionId },
      data: { status: 'REJECTED' },
      include: revisionInclude,
    }),
    prisma.approval.create({
      data: {
        contentRevisionId: revisionId,
        approverId: actorId,
        outcome: 'REJECTED',
        notes: reason.trim(),
        coveredLocale: revision.contentVariant.locale,
      },
    }),
  ]);
  await writeAudit(actorId, 'CONTENT_REJECT', revision.contentVariant.contentItemId, {
    revisionId,
    revisionNumber: revision.revisionNumber,
    locale: revision.contentVariant.locale,
  });
  return toWorkflowRevision(updated);
}

async function assertSlugAvailable(locale: string, slug: string, excludeContentItemId: string): Promise<void> {
  const clash = await prisma.contentVariant.findFirst({
    where: { locale, slug, NOT: { contentItemId: excludeContentItemId } },
    select: { id: true },
  });
  if (clash) {
    throw new ConflictError(`Slug "${slug}" is already in use for locale "${locale}".`);
  }
}

export async function publishRevision(revisionId: string, actorId: string, allowedTypes: ManagedContentType[] = ['PRODUCT']) {
  const revision = await findRevisionOrThrow(revisionId, allowedTypes);
  if (revision.status !== 'APPROVED') {
    throw new ConflictError(`Only APPROVED revisions can be published (current: ${revision.status}).`);
  }
  await requireLatest(revision);
  const approval = await prisma.approval.findFirst({
    where: { contentRevisionId: revisionId, outcome: 'APPROVED' },
    select: { id: true },
  });
  if (!approval) {
    throw new ConflictError('No approval evidence for this revision.');
  }
  const snapshot = parseSnapshot(revision.materialSnapshot);
  const locale = revision.contentVariant.locale;
  if (!snapshot.slug || !snapshot.name) {
    throw new ValidationError('Approved snapshot is missing slug or name.', []);
  }
  await assertSlugAvailable(locale, snapshot.slug, revision.contentVariant.contentItemId);

  const contentType = revision.contentVariant.contentItem.type as ManagedContentType;
  const contentItemId = revision.contentVariant.contentItemId;

  const extOps = [];
  if (contentType === 'PRODUCT' && snapshot.product) {
    const productPatch: Record<string, string | null | undefined> = {};
    for (const key of ['internalIdentifier', 'surfaceFinish', 'dimensions', 'format', 'origin', 'applicableStandards'] as const) {
      if (snapshot.product[key] !== undefined) {
        const value = snapshot.product[key];
        productPatch[key] = value === '' ? null : value;
      }
    }
    extOps.push(
      prisma.product.update({ where: { contentItemId }, data: productPatch })
    );
  }
  if (contentType === 'PROJECT' && snapshot.project) {
    const projectPatch: Record<string, string | null | undefined> = {};
    for (const key of ['location', 'projectType'] as const) {
      if (snapshot.project[key] !== undefined) {
        const value = snapshot.project[key];
        projectPatch[key] = value === '' ? null : value;
      }
    }
    extOps.push(prisma.project.update({ where: { contentItemId }, data: projectPatch }));
  }
  if (contentType === 'JOURNAL_ARTICLE' && snapshot.journal) {
    const journalPatch: Record<string, Date | string | null | undefined> = {};
    if (snapshot.journal.publicationDate !== undefined) {
      const parsed = snapshot.journal.publicationDate ? new Date(snapshot.journal.publicationDate) : null;
      if (parsed !== null && Number.isNaN(parsed.getTime())) {
        throw new ValidationError('Approved snapshot has an invalid publication date.', []);
      }
      if (parsed !== null) journalPatch.publicationDate = parsed;
    }
    if (snapshot.journal.authorName !== undefined) {
      journalPatch.authorName = snapshot.journal.authorName === '' ? null : snapshot.journal.authorName;
    }
    extOps.push(prisma.journalArticle.update({ where: { contentItemId }, data: journalPatch }));
  }

  await prisma.$transaction([
    prisma.contentVariant.update({
      where: { id: revision.contentVariantId },
      data: {
        slug: snapshot.slug,
        name: snapshot.name,
        description: snapshot.description ?? '',
        tagline: snapshot.tagline ?? null,
        seoTitle: snapshot.seoTitle ?? null,
        seoDescription: snapshot.seoDescription ?? null,
        seoCanonical: snapshot.seoCanonical ?? null,
        seoRobots: snapshot.seoRobots ?? null,
        isFeatured: snapshot.isFeatured ?? false,
        featuredOrder: snapshot.featuredOrder ?? null,
        displayOrder: snapshot.displayOrder ?? null,
        lifecycleState: 'PUBLISHED',
      },
    }),
    ...extOps,
    prisma.contentItem.update({
      where: { id: contentItemId },
      data: { aggregateState: 'ACTIVE' },
    }),
    prisma.contentRevision.update({ where: { id: revisionId }, data: { status: 'PUBLISHED' } }),
  ]);

  await writeAudit(actorId, 'CONTENT_PUBLISH', revision.contentVariant.contentItemId, {
    revisionId,
    revisionNumber: revision.revisionNumber,
    locale,
    slug: snapshot.slug,
  });

  return getContentWorkflow(revision.contentVariant.contentItemId, revision.contentVariant.contentItem.type as ManagedContentType);
}

export async function unpublishProduct(productId: string, locale: Locale, actorId: string) {
  return unpublishContent(productId, 'PRODUCT', locale, actorId);
}

export async function unpublishContent(
  contentId: string,
  contentType: ManagedContentType,
  locale: Locale,
  actorId: string
) {
  const item = await prisma.contentItem.findUnique({
    where: { id: contentId },
    include: { variants: { where: { locale } } },
  });
  if (!item || item.type !== contentType || item.variants.length === 0) {
    throw new NotFoundError('Content variant not found.');
  }
  const variant = item.variants[0];
  if (variant.lifecycleState !== 'PUBLISHED') {
    throw new ConflictError(`Variant is ${variant.lifecycleState}, nothing to unpublish.`);
  }
  await prisma.contentVariant.update({ where: { id: variant.id }, data: { lifecycleState: 'UNPUBLISHED' } });
  await writeAudit(actorId, 'CONTENT_UNPUBLISH', contentId, { locale, slug: variant.slug });
  return getContentWorkflow(contentId, contentType);
}

export async function getProductWorkflow(productId: string) {
  return getContentWorkflow(productId, 'PRODUCT');
}

export async function getContentWorkflow(contentId: string, contentType: ManagedContentType) {
  const item = await prisma.contentItem.findUnique({
    where: { id: contentId },
    include: {
      variants: {
        include: {
          revisions: { include: revisionInclude, orderBy: { revisionNumber: 'desc' } },
        },
      },
    },
  });
  if (!item || item.type !== contentType) {
    throw new NotFoundError('Content not found.');
  }
  const locales: Record<string, LocaleWorkflow> = {};
  for (const variant of item.variants) {
    if (!SUPPORTED_LOCALES.includes(variant.locale as Locale)) continue;
    const open = variant.revisions.find((r) => (OPEN_STATUSES as string[]).includes(r.status)) ?? null;
    const published = variant.revisions.filter((r) => r.status === 'PUBLISHED').sort((a, b) => b.revisionNumber - a.revisionNumber)[0] ?? null;
    locales[variant.locale] = {
      locale: variant.locale as Locale,
      lifecycleState: variant.lifecycleState,
      openRevision: open ? toWorkflowRevision(open) : null,
      publishedRevisionNumber: published?.revisionNumber ?? null,
    };
  }
  return { productId: contentId, locales };
}

export async function listProductRevisions(productId: string, locale?: Locale) {
  return listContentRevisions(productId, 'PRODUCT', locale);
}

export async function listContentRevisions(contentId: string, contentType: ManagedContentType, locale?: Locale) {
  const item = await prisma.contentItem.findUnique({
    where: { id: contentId },
    include: { variants: { select: { id: true, locale: true } } },
  });
  if (!item || item.type !== contentType) {
    throw new NotFoundError('Content not found.');
  }
  const variantIds = item.variants
    .filter((v) => (locale ? v.locale === locale : SUPPORTED_LOCALES.includes(v.locale as Locale)))
    .map((v) => v.id);
  const revisions = await prisma.contentRevision.findMany({
    where: { contentVariantId: { in: variantIds } },
    include: {
      ...revisionInclude,
      contentVariant: { select: { locale: true } },
    },
    orderBy: [{ contentVariantId: 'asc' }, { revisionNumber: 'desc' }],
  });
  return revisions.map((r) => ({
    ...toWorkflowRevision(r),
    locale: (r as unknown as { contentVariant: { locale: string } }).contentVariant.locale,
  }));
}
