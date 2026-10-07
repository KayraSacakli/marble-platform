import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError } from '@/lib/api/errors';
import { normalizePagination, buildPaginationMeta } from '@/lib/api/validation';
import { writeAudit } from '@/services/adminAudit';
import {
  ensureDraftRevision,
  patchDraftSnapshot,
  findOpenRevision,
  parseSnapshot,
  type DraftSnapshot,
} from '@/services/adminWorkflow';
import type {
  AdminProjectCreateInput,
  AdminProjectUpdateInput,
  AdminJournalCreateInput,
  AdminJournalUpdateInput,
  SeoRobotsValue,
} from '@/lib/api/validation';
import { SUPPORTED_LOCALES, type Locale } from '@/types/locale';

// ============================================================
// Admin Project / JournalArticle management (server-side,
// session-guarded callers). Same draft-overlay workflow model
// as products/collections; type-specific extension tables and
// relationship junctions.
// ============================================================

export type EditorialKind = 'PROJECT' | 'JOURNAL_ARTICLE';

interface KindConfig {
  type: EditorialKind;
  notFound: string;
  createAction: string;
  updateAction: string;
  deleteAction: string;
}

const KINDS: Record<EditorialKind, KindConfig> = {
  PROJECT: {
    type: 'PROJECT',
    notFound: 'Project not found.',
    createAction: 'PROJECT_CREATE',
    updateAction: 'PROJECT_UPDATE',
    deleteAction: 'PROJECT_DELETE',
  },
  JOURNAL_ARTICLE: {
    type: 'JOURNAL_ARTICLE',
    notFound: 'Journal article not found.',
    createAction: 'JOURNAL_CREATE',
    updateAction: 'JOURNAL_UPDATE',
    deleteAction: 'JOURNAL_DELETE',
  },
};

export interface AdminEditorialVariant {
  id: string;
  locale: string;
  slug: string;
  name: string | null;
  description: string | null;
  tagline: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonical: string | null;
  seoRobots: string | null;
  isFeatured: boolean;
  featuredOrder: number | null;
  displayOrder: number | null;
  lifecycleState: string;
  draft: { revisionId: string; revisionNumber: number; status: string } | null;
}

export interface AdminEditorial {
  id: string;
  kind: EditorialKind;
  aggregateState: string;
  location: string | null;
  projectType: string | null;
  publicationDate: string | null;
  authorName: string | null;
  createdAt: string;
  updatedAt: string;
  tr: AdminEditorialVariant | null;
  en: AdminEditorialVariant | null;
  variants: Partial<Record<Locale, AdminEditorialVariant>>;
}

type VariantRow = {
  id: string;
  locale: string;
  slug: string;
  name: string | null;
  description: string | null;
  tagline: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonical: string | null;
  seoRobots: string | null;
  isFeatured: boolean;
  featuredOrder: number | null;
  displayOrder: number | null;
  lifecycleState: string;
};

type ItemWithExt = {
  id: string;
  aggregateState: string;
  createdAt: Date;
  updatedAt: Date;
  product?: unknown;
  project?: { location: string | null; projectType: string | null } | null;
  journalArticle?: { publicationDate: Date; authorName: string | null } | null;
  variants: VariantRow[];
};

function toAdminEditorial(kind: EditorialKind, item: ItemWithExt): AdminEditorial {
  const variants: Partial<Record<Locale, AdminEditorialVariant>> = {};
  for (const locale of SUPPORTED_LOCALES) {
    const v = item.variants.find((variant) => variant.locale === locale);
    if (!v) continue;
    variants[locale] = { ...v, draft: null };
  }
  return {
    id: item.id,
    kind,
    aggregateState: item.aggregateState,
    location: item.project?.location ?? null,
    projectType: item.project?.projectType ?? null,
    publicationDate: item.journalArticle ? item.journalArticle.publicationDate.toISOString() : null,
    authorName: item.journalArticle?.authorName ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    tr: variants.tr ?? null,
    en: variants.en ?? null,
    variants,
  };
}

const itemInclude = {
  project: true,
  journalArticle: true,
  variants: { orderBy: { locale: 'asc' as const } },
};

async function findItemOrThrow(kind: EditorialKind, id: string) {
  const item = await prisma.contentItem.findUnique({ where: { id }, include: itemInclude });
  if (!item || item.type !== kind) {
    throw new NotFoundError(KINDS[kind].notFound);
  }
  return item;
}

async function assertSlugAvailable(
  locale: string,
  slug: string,
  excludeContentItemId?: string,
): Promise<void> {
  const clash = await prisma.contentVariant.findFirst({
    where: {
      locale,
      slug,
      ...(excludeContentItemId ? { NOT: { contentItemId: excludeContentItemId } } : {}),
    },
    select: { id: true },
  });
  if (clash) {
    throw new ConflictError(`Slug "${slug}" is already in use for locale "${locale}".`);
  }
}

type VariantInput = {
  slug: string;
  name: string;
  description?: string;
  tagline?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoCanonical?: string;
  seoRobots?: SeoRobotsValue;
  isFeatured?: boolean;
  featuredOrder?: number | null;
  displayOrder?: number | null;
};

function variantCreateData(locale: Locale, input: VariantInput) {
  return {
    locale,
    lifecycleState: 'DRAFT' as const,
    slug: input.slug,
    name: input.name,
    description: input.description ?? '',
    tagline: input.tagline ?? undefined,
    seoTitle: input.seoTitle ?? undefined,
    seoDescription: input.seoDescription ?? undefined,
    seoCanonical: input.seoCanonical ?? undefined,
    seoRobots: input.seoRobots ?? undefined,
    isFeatured: input.isFeatured ?? false,
    featuredOrder: input.featuredOrder ?? undefined,
    displayOrder: input.displayOrder ?? undefined,
  };
}

function snapshotInput(
  kind: EditorialKind,
  localeInput: VariantInput,
  ext: Record<string, unknown>,
): DraftSnapshot {
  const base: DraftSnapshot = {
    slug: localeInput.slug,
    name: localeInput.name,
    description: localeInput.description ?? '',
    tagline: localeInput.tagline ?? null,
    seoTitle: localeInput.seoTitle ?? null,
    seoDescription: localeInput.seoDescription ?? null,
    seoCanonical: localeInput.seoCanonical ?? null,
    seoRobots: localeInput.seoRobots ?? null,
    isFeatured: localeInput.isFeatured ?? false,
    featuredOrder: localeInput.featuredOrder ?? null,
    displayOrder: localeInput.displayOrder ?? null,
  };
  if (kind === 'PROJECT') {
    base.project = {
      location: (ext.location as string | undefined) ?? null,
      projectType: (ext.projectType as string | undefined) ?? null,
    };
  } else {
    base.journal = {
      publicationDate: (ext.publicationDate as string | undefined) ?? null,
      authorName: (ext.authorName as string | undefined) ?? null,
    };
  }
  return base;
}

function mergeVariantPatch(target: DraftSnapshot, patch: Record<string, unknown>): void {
  for (const key of [
    'slug',
    'name',
    'description',
    'tagline',
    'seoTitle',
    'seoDescription',
    'seoCanonical',
    'seoRobots',
    'isFeatured',
    'featuredOrder',
    'displayOrder',
  ] as const) {
    if (patch[key] !== undefined) {
      (target as Record<string, unknown>)[key] = patch[key];
    }
  }
}

export async function listAdminEditorial(
  kind: EditorialKind,
  options: { page?: number; pageSize?: number; q?: string },
) {
  const { page, pageSize, skip } = normalizePagination({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
  });
  const q = options.q?.trim();
  const where = {
    type: kind,
    ...(q
      ? {
          variants: {
            some: {
              OR: [
                { slug: { contains: q, mode: 'insensitive' as const } },
                { name: { contains: q, mode: 'insensitive' as const } },
              ],
            },
          },
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.contentItem.findMany({
      where,
      include: itemInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.contentItem.count({ where }),
  ]);
  return {
    data: items.map((item) => toAdminEditorial(kind, item as unknown as ItemWithExt)),
    meta: buildPaginationMeta(page, pageSize, total),
  };
}

export async function getAdminEditorial(kind: EditorialKind, id: string): Promise<AdminEditorial> {
  const item = await findItemOrThrow(kind, id);
  const view = toAdminEditorial(kind, item as unknown as ItemWithExt);
  for (const locale of SUPPORTED_LOCALES) {
    const cell = view.variants[locale];
    if (!cell) continue;
    const variant = (
      item as unknown as ItemWithExt & { variants: Array<VariantRow & { id: string }> }
    ).variants.find((v) => v.locale === locale);
    if (!variant) continue;
    const open = await findOpenRevision(variant.id);
    if (
      !open ||
      (open.status !== 'DRAFT' && open.status !== 'IN_REVIEW' && open.status !== 'APPROVED')
    )
      continue;
    const snapshot = parseSnapshot(open.materialSnapshot);
    if (snapshot.slug !== undefined) cell.slug = snapshot.slug;
    if (snapshot.name !== undefined) cell.name = snapshot.name;
    if (snapshot.description !== undefined) cell.description = snapshot.description;
    if (snapshot.tagline !== undefined) cell.tagline = snapshot.tagline ?? null;
    if (snapshot.seoTitle !== undefined) cell.seoTitle = snapshot.seoTitle ?? null;
    if (snapshot.seoDescription !== undefined)
      cell.seoDescription = snapshot.seoDescription ?? null;
    if (snapshot.seoCanonical !== undefined) cell.seoCanonical = snapshot.seoCanonical ?? null;
    if (snapshot.seoRobots !== undefined) cell.seoRobots = snapshot.seoRobots ?? null;
    if (snapshot.isFeatured !== undefined) cell.isFeatured = snapshot.isFeatured;
    if (snapshot.featuredOrder !== undefined) cell.featuredOrder = snapshot.featuredOrder;
    if (snapshot.displayOrder !== undefined) cell.displayOrder = snapshot.displayOrder;
    if (kind === 'PROJECT' && snapshot.project) {
      if (snapshot.project.location !== undefined) view.location = snapshot.project.location;
      if (snapshot.project.projectType !== undefined)
        view.projectType = snapshot.project.projectType;
    }
    if (kind === 'JOURNAL_ARTICLE' && snapshot.journal) {
      if (snapshot.journal.publicationDate !== undefined)
        view.publicationDate = snapshot.journal.publicationDate;
      if (snapshot.journal.authorName !== undefined) view.authorName = snapshot.journal.authorName;
    }
    cell.draft = { revisionId: open.id, revisionNumber: open.revisionNumber, status: open.status };
  }
  return view;
}

type CreateInput = AdminProjectCreateInput | AdminJournalCreateInput;

export async function createAdminEditorial(
  kind: EditorialKind,
  input: CreateInput,
  actorId: string,
): Promise<AdminEditorial> {
  const locales = SUPPORTED_LOCALES.filter((l) => input[l]);
  for (const locale of locales) {
    const localeInput = input[locale];
    if (!localeInput) continue;
    await assertSlugAvailable(locale, localeInput.slug);
  }

  const extCreate =
    kind === 'PROJECT'
      ? {
          project: {
            create: {
              location: (input as AdminProjectCreateInput).location ?? null,
              projectType: (input as AdminProjectCreateInput).projectType ?? null,
            },
          },
        }
      : {
          journalArticle: {
            create: {
              publicationDate: new Date((input as AdminJournalCreateInput).publicationDate),
              authorName: (input as AdminJournalCreateInput).authorName ?? null,
            },
          },
        };

  const item = await prisma.contentItem.create({
    data: {
      type: kind,
      aggregateState: 'DRAFT',
      ...extCreate,
      variants: {
        create: locales.flatMap((locale) => {
          const localeInput = input[locale];
          return localeInput ? [variantCreateData(locale, localeInput)] : [];
        }),
      },
    },
    include: { ...itemInclude, variants: { orderBy: { locale: 'asc' as const } } },
  });

  const extBag: Record<string, unknown> =
    kind === 'PROJECT'
      ? {
          location: (input as AdminProjectCreateInput).location ?? null,
          projectType: (input as AdminProjectCreateInput).projectType ?? null,
        }
      : {
          publicationDate: (input as AdminJournalCreateInput).publicationDate,
          authorName: (input as AdminJournalCreateInput).authorName ?? null,
        };

  for (const variant of item.variants) {
    const localeInput = input[variant.locale as Locale];
    if (!localeInput) continue;
    const created = await prisma.contentRevision.create({
      data: {
        contentVariantId: variant.id,
        authorId: actorId,
        revisionNumber: 1,
        status: 'DRAFT',
        materialSnapshot: JSON.stringify(snapshotInput(kind, localeInput, extBag)),
      },
    });
    await writeAudit(actorId, 'CONTENT_REVISION_CREATE', item.id, {
      variantId: variant.id,
      revisionId: created.id,
      revisionNumber: 1,
      locale: variant.locale,
    });
  }

  await writeAudit(actorId, KINDS[kind].createAction, item.id, {
    trSlug: input.tr.slug,
    enSlug: input.en.slug,
    name: input.tr.name,
  });

  return getAdminEditorial(kind, item.id);
}

type UpdateInput = AdminProjectUpdateInput | AdminJournalUpdateInput;

export async function updateAdminEditorial(
  kind: EditorialKind,
  id: string,
  input: UpdateInput,
  actorId: string,
): Promise<AdminEditorial> {
  const item = await findItemOrThrow(kind, id);
  const typed = item as unknown as ItemWithExt & { variants: Array<VariantRow & { id: string }> };

  for (const locale of SUPPORTED_LOCALES) {
    const localeInput = input[locale];
    if (localeInput?.slug) {
      await assertSlugAvailable(locale, localeInput.slug, id);
    }
  }

  const extPatch: Record<string, unknown> = {};
  for (const key of Object.keys(input).filter((k) => !SUPPORTED_LOCALES.includes(k as Locale))) {
    const value = (input as Record<string, unknown>)[key];
    if (value !== undefined) extPatch[key] = value === '' ? null : value;
  }
  const hasExtPatch = Object.keys(extPatch).length > 0;

  for (const locale of SUPPORTED_LOCALES) {
    const patch = (input[locale] ?? {}) as Record<string, unknown>;
    const variant = typed.variants.find((v) => v.locale === locale);
    if (!variant) continue;

    if (variant.lifecycleState === 'PUBLISHED') {
      const draft = await ensureDraftRevision(variant.id, actorId);
      const snapshotPatch: DraftSnapshot = {};
      mergeVariantPatch(snapshotPatch, patch);
      if (hasExtPatch) {
        if (kind === 'PROJECT') {
          snapshotPatch.project = {
            ...(snapshotPatch.project ?? {}),
            ...(extPatch.location !== undefined
              ? { location: extPatch.location as string | null }
              : {}),
            ...(extPatch.projectType !== undefined
              ? { projectType: extPatch.projectType as string | null }
              : {}),
          };
        } else {
          snapshotPatch.journal = {
            ...(snapshotPatch.journal ?? {}),
            ...(extPatch.publicationDate !== undefined
              ? { publicationDate: extPatch.publicationDate as string | null }
              : {}),
            ...(extPatch.authorName !== undefined
              ? { authorName: extPatch.authorName as string | null }
              : {}),
          };
        }
      }
      if (Object.keys(snapshotPatch).length > 0 || snapshotPatch.project || snapshotPatch.journal) {
        await patchDraftSnapshot(draft.id, snapshotPatch, actorId, [kind]);
      }
      continue;
    }

    // Never-published: write rows directly (still hidden) + sync open draft.
    if (hasExtPatch) {
      if (kind === 'PROJECT') {
        await prisma.project.update({ where: { contentItemId: id }, data: extPatch as never });
      } else {
        const journalPatch: Record<string, unknown> = { ...extPatch };
        if (typeof journalPatch.publicationDate === 'string') {
          journalPatch.publicationDate = new Date(journalPatch.publicationDate);
        }
        await prisma.journalArticle.update({
          where: { contentItemId: id },
          data: journalPatch as never,
        });
      }
    }
    if (Object.keys(patch).length > 0) {
      await prisma.contentVariant.update({
        where: { id: variant.id },
        data: {
          ...(patch.slug !== undefined ? { slug: patch.slug as string } : {}),
          ...(patch.name !== undefined ? { name: patch.name as string } : {}),
          ...(patch.description !== undefined ? { description: patch.description as string } : {}),
          ...(patch.tagline !== undefined ? { tagline: patch.tagline as string } : {}),
          ...(patch.seoTitle !== undefined ? { seoTitle: patch.seoTitle } : {}),
          ...(patch.seoDescription !== undefined ? { seoDescription: patch.seoDescription } : {}),
          ...(patch.seoCanonical !== undefined ? { seoCanonical: patch.seoCanonical } : {}),
          ...(patch.seoRobots !== undefined ? { seoRobots: patch.seoRobots } : {}),
          ...(patch.isFeatured !== undefined ? { isFeatured: patch.isFeatured as boolean } : {}),
          ...(patch.featuredOrder !== undefined
            ? { featuredOrder: patch.featuredOrder as number | null }
            : {}),
          ...(patch.displayOrder !== undefined
            ? { displayOrder: patch.displayOrder as number | null }
            : {}),
        },
      });
      const open = await findOpenRevision(variant.id);
      if (open && open.status === 'DRAFT') {
        const snapshotPatch: DraftSnapshot = {};
        mergeVariantPatch(snapshotPatch, patch);
        if (Object.keys(snapshotPatch).length > 0) {
          await patchDraftSnapshot(open.id, snapshotPatch, actorId, [kind]);
        }
      }
    }
  }

  await writeAudit(actorId, KINDS[kind].updateAction, id, {
    patchedLocales: SUPPORTED_LOCALES.filter((l) => (input as Record<string, unknown>)[l]),
  });

  return getAdminEditorial(kind, id);
}

export async function deleteAdminEditorial(kind: EditorialKind, id: string, actorId: string) {
  const item = await findItemOrThrow(kind, id);
  const typed = item as unknown as ItemWithExt;
  const tr = typed.variants.find((v) => v.locale === 'tr');
  // Junction/reference rows cascade per schema; related content is untouched.
  await writeAudit(actorId, KINDS[kind].deleteAction, id, {
    trSlug: (tr as VariantRow | undefined)?.slug ?? null,
    name: (tr as VariantRow | undefined)?.name ?? null,
  });
  await prisma.contentItem.delete({ where: { id } });
  return { deleted: true as const, id };
}

// ============================================================
// Relationships (existing junctions / reference rows)
// ============================================================

export interface RelatedEntry {
  id: string;
  targetKind: 'product' | 'application' | 'project';
  targetId: string;
  trName: string | null;
  trSlug: string | null;
  enName: string | null;
  attachedAt: string;
}

async function findProductOrThrow(productId: string) {
  const product = await prisma.contentItem.findUnique({
    where: { id: productId },
    include: { variants: { select: { locale: true, slug: true, name: true } } },
  });
  if (!product || product.type !== 'PRODUCT') {
    throw new NotFoundError('Product not found.');
  }
  return product;
}

async function findApplicationOrThrow(applicationId: string) {
  const application = await prisma.contentItem.findUnique({
    where: { id: applicationId },
    include: { variants: { select: { locale: true, slug: true, name: true } } },
  });
  if (!application || application.type !== 'APPLICATION') {
    throw new NotFoundError('Application not found.');
  }
  return application;
}

async function findProjectOrThrow(projectId: string) {
  const project = await prisma.contentItem.findUnique({
    where: { id: projectId },
    include: { variants: { select: { locale: true, slug: true, name: true } } },
  });
  if (!project || project.type !== 'PROJECT') {
    throw new NotFoundError('Project not found.');
  }
  return project;
}

function variantName(
  variants: Array<{ locale: string; slug: string; name: string | null }>,
  locale: string,
) {
  const v = variants.find((x) => x.locale === locale);
  return v ? { name: v.name, slug: v.slug } : { name: null, slug: null };
}

export async function listProjectRelations(
  kind: 'products' | 'applications',
  projectId: string,
): Promise<RelatedEntry[]> {
  await findItemOrThrow('PROJECT', projectId);
  if (kind === 'products') {
    const rows = await prisma.projectProduct.findMany({
      where: { projectId },
      include: { product: { include: { contentItem: { include: { variants: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => {
      const tr = variantName(r.product.contentItem.variants, 'tr');
      const en = variantName(r.product.contentItem.variants, 'en');
      return {
        id: `${r.projectId}:${r.productId}`,
        targetKind: 'product' as const,
        targetId: r.productId,
        trName: tr.name,
        trSlug: tr.slug,
        enName: en.name,
        attachedAt: r.createdAt.toISOString(),
      };
    });
  }
  const rows = await prisma.projectApplication.findMany({
    where: { projectId },
    include: { application: { include: { contentItem: { include: { variants: true } } } } },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((r) => {
    const tr = variantName(r.application.contentItem.variants, 'tr');
    const en = variantName(r.application.contentItem.variants, 'en');
    return {
      id: `${r.projectId}:${r.applicationId}`,
      targetKind: 'application' as const,
      targetId: r.applicationId,
      trName: tr.name,
      trSlug: tr.slug,
      enName: en.name,
      attachedAt: r.createdAt.toISOString(),
    };
  });
}

export async function attachProjectRelation(
  kind: 'products' | 'applications',
  projectId: string,
  targetId: string,
  actorId: string,
) {
  await findItemOrThrow('PROJECT', projectId);
  if (kind === 'products') {
    await findProductOrThrow(targetId);
    const existing = await prisma.projectProduct.findUnique({
      where: { projectId_productId: { projectId, productId: targetId } },
    });
    if (existing) {
      throw new ConflictError('Product is already attached to this project.');
    }
    await prisma.projectProduct.create({ data: { projectId, productId: targetId } });
    await writeAudit(actorId, 'PROJECT_PRODUCT_ATTACH', projectId, { productId: targetId });
  } else {
    await findApplicationOrThrow(targetId);
    const existing = await prisma.projectApplication.findUnique({
      where: { projectId_applicationId: { projectId, applicationId: targetId } },
    });
    if (existing) {
      throw new ConflictError('Application is already attached to this project.');
    }
    await prisma.projectApplication.create({ data: { projectId, applicationId: targetId } });
    await writeAudit(actorId, 'PROJECT_APPLICATION_ATTACH', projectId, { applicationId: targetId });
  }
  return listProjectRelations(kind, projectId);
}

export async function detachProjectRelation(
  kind: 'products' | 'applications',
  projectId: string,
  targetId: string,
  actorId: string,
) {
  await findItemOrThrow('PROJECT', projectId);
  const removed =
    kind === 'products'
      ? await prisma.projectProduct.deleteMany({ where: { projectId, productId: targetId } })
      : await prisma.projectApplication.deleteMany({
          where: { projectId, applicationId: targetId },
        });
  if (removed.count === 0) {
    throw new NotFoundError('Relation not found.');
  }
  await writeAudit(
    actorId,
    kind === 'products' ? 'PROJECT_PRODUCT_DETACH' : 'PROJECT_APPLICATION_DETACH',
    projectId,
    {
      targetId,
    },
  );
  return { detached: true as const };
}

export interface JournalReference extends RelatedEntry {
  referenceId: string;
}

export async function listJournalReferences(journalId: string): Promise<JournalReference[]> {
  await findItemOrThrow('JOURNAL_ARTICLE', journalId);
  const rows = await prisma.journalContentReference.findMany({
    where: { journalArticleId: journalId },
    include: {
      product: { include: { contentItem: { include: { variants: true } } } },
      application: { include: { contentItem: { include: { variants: true } } } },
      project: { include: { contentItem: { include: { variants: true } } } },
    },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((r) => {
    const target = r.product ?? r.application ?? r.project;
    const targetKind = r.product ? 'product' : r.application ? 'application' : 'project';
    const targetId = r.productProductId ?? r.applicationId ?? r.projectId ?? '';
    const variants = target?.contentItem.variants ?? [];
    const tr = variantName(variants, 'tr');
    const en = variantName(variants, 'en');
    return {
      id: r.id,
      referenceId: r.id,
      targetKind: targetKind as JournalReference['targetKind'],
      targetId,
      trName: tr.name,
      trSlug: tr.slug,
      enName: en.name,
      attachedAt: r.createdAt.toISOString(),
    };
  });
}

export async function attachJournalReference(
  journalId: string,
  targetKind: 'product' | 'application' | 'project',
  targetId: string,
  actorId: string,
) {
  await findItemOrThrow('JOURNAL_ARTICLE', journalId);
  if (targetKind === 'product') {
    await findProductOrThrow(targetId);
  } else if (targetKind === 'application') {
    await findApplicationOrThrow(targetId);
  } else {
    await findProjectOrThrow(targetId);
  }
  const where = {
    journalArticleId: journalId,
    ...(targetKind === 'product'
      ? { productProductId: targetId }
      : targetKind === 'application'
        ? { applicationId: targetId }
        : { projectId: targetId }),
  };
  const existing = await prisma.journalContentReference.findFirst({ where, select: { id: true } });
  if (existing) {
    throw new ConflictError('This reference already exists.');
  }
  await prisma.journalContentReference.create({ data: where });
  await writeAudit(actorId, 'JOURNAL_REFERENCE_ATTACH', journalId, { targetKind, targetId });
  return listJournalReferences(journalId);
}

export async function detachJournalReference(
  journalId: string,
  referenceId: string,
  actorId: string,
) {
  await findItemOrThrow('JOURNAL_ARTICLE', journalId);
  const removed = await prisma.journalContentReference.deleteMany({
    where: { id: referenceId, journalArticleId: journalId },
  });
  if (removed.count === 0) {
    throw new NotFoundError('Reference not found.');
  }
  await writeAudit(actorId, 'JOURNAL_REFERENCE_DETACH', journalId, { referenceId });
  return { detached: true as const };
}
