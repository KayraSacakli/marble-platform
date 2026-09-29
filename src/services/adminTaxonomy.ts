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
  AdminCollectionCreateInput,
  AdminCollectionUpdateInput,
  AdminApplicationCreateInput,
  AdminApplicationUpdateInput,
} from '@/lib/api/validation';

// ============================================================
// Admin Collection / Application management (server-side,
// session-guarded callers). Both kinds share the variant shape
// and have no extension table; relations use existing junctions.
// ============================================================

export type TaxonomyKind = 'COLLECTION' | 'APPLICATION';

interface KindConfig {
  type: TaxonomyKind;
  notFound: string;
  createAction: string;
  updateAction: string;
  deleteAction: string;
  attachAction: string;
  detachAction: string;
}

const KINDS: Record<TaxonomyKind, KindConfig> = {
  COLLECTION: {
    type: 'COLLECTION',
    notFound: 'Collection not found.',
    createAction: 'COLLECTION_CREATE',
    updateAction: 'COLLECTION_UPDATE',
    deleteAction: 'COLLECTION_DELETE',
    attachAction: 'COLLECTION_PRODUCT_ATTACH',
    detachAction: 'COLLECTION_PRODUCT_DETACH',
  },
  APPLICATION: {
    type: 'APPLICATION',
    notFound: 'Application not found.',
    createAction: 'APPLICATION_CREATE',
    updateAction: 'APPLICATION_UPDATE',
    deleteAction: 'APPLICATION_DELETE',
    attachAction: 'APPLICATION_PRODUCT_ATTACH',
    detachAction: 'APPLICATION_PRODUCT_DETACH',
  },
};

export interface AdminTaxonomyVariant {
  id: string;
  locale: string;
  slug: string;
  name: string | null;
  description: string | null;
  tagline: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  seoCanonical: string | null;
  isFeatured: boolean;
  featuredOrder: number | null;
  displayOrder: number | null;
  lifecycleState: string;
  draft: { revisionId: string; revisionNumber: number; status: string } | null;
}

export interface AdminTaxonomy {
  id: string;
  kind: TaxonomyKind;
  aggregateState: string;
  createdAt: string;
  updatedAt: string;
  tr: AdminTaxonomyVariant | null;
  en: AdminTaxonomyVariant | null;
}

export interface AttachedProduct {
  id: string;
  trName: string | null;
  trSlug: string | null;
  enName: string | null;
  attachedAt: string;
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
  isFeatured: boolean;
  featuredOrder: number | null;
  displayOrder: number | null;
  lifecycleState: string;
};

type ItemWithVariants = {
  id: string;
  aggregateState: string;
  createdAt: Date;
  updatedAt: Date;
  variants: VariantRow[];
};

function toAdminTaxonomy(kind: TaxonomyKind, item: ItemWithVariants): AdminTaxonomy {
  const byLocale = (locale: string): AdminTaxonomyVariant | null => {
    const v = item.variants.find((variant) => variant.locale === locale);
    if (!v) return null;
    return { ...v, draft: null };
  };
  return {
    id: item.id,
    kind,
    aggregateState: item.aggregateState,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    tr: byLocale('tr'),
    en: byLocale('en'),
  };
}

const itemInclude = {
  variants: { orderBy: { locale: 'asc' as const } },
};

async function findItemOrThrow(kind: TaxonomyKind, id: string) {
  const item = await prisma.contentItem.findUnique({
    where: { id },
    include: itemInclude,
  });
  if (!item || item.type !== kind) {
    throw new NotFoundError(KINDS[kind].notFound);
  }
  return item;
}

async function assertSlugAvailable(locale: string, slug: string, excludeContentItemId?: string): Promise<void> {
  const clash = await prisma.contentVariant.findFirst({
    where: { locale, slug, ...(excludeContentItemId ? { NOT: { contentItemId: excludeContentItemId } } : {}) },
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
  isFeatured?: boolean;
  featuredOrder?: number | null;
  displayOrder?: number | null;
};

function variantCreateData(locale: 'tr' | 'en', input: VariantInput) {
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
    isFeatured: input.isFeatured ?? false,
    featuredOrder: input.featuredOrder ?? undefined,
    displayOrder: input.displayOrder ?? undefined,
  };
}

function snapshotInput(localeInput: VariantInput): DraftSnapshot {
  return {
    slug: localeInput.slug,
    name: localeInput.name,
    description: localeInput.description ?? '',
    tagline: localeInput.tagline ?? null,
    seoTitle: localeInput.seoTitle ?? null,
    seoDescription: localeInput.seoDescription ?? null,
    seoCanonical: localeInput.seoCanonical ?? null,
    isFeatured: localeInput.isFeatured ?? false,
    featuredOrder: localeInput.featuredOrder ?? null,
    displayOrder: localeInput.displayOrder ?? null,
  };
}

export async function listAdminTaxonomy(kind: TaxonomyKind, options: { page?: number; pageSize?: number; q?: string }) {
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
    prisma.contentItem.findMany({ where, include: itemInclude, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
    prisma.contentItem.count({ where }),
  ]);
  return {
    data: items.map((item) => toAdminTaxonomy(kind, item as unknown as ItemWithVariants)),
    meta: buildPaginationMeta(page, pageSize, total),
  };
}

export async function getAdminTaxonomy(kind: TaxonomyKind, id: string): Promise<AdminTaxonomy> {
  const item = await findItemOrThrow(kind, id);
  const view = toAdminTaxonomy(kind, item as unknown as ItemWithVariants);
  for (const locale of ['tr', 'en'] as const) {
    const cell = view[locale];
    if (!cell) continue;
    const variant = (item as unknown as ItemWithVariants).variants.find((v) => v.locale === locale);
    if (!variant) continue;
    const open = await findOpenRevision(variant.id);
    if (!open || (open.status !== 'DRAFT' && open.status !== 'IN_REVIEW' && open.status !== 'APPROVED')) continue;
    const snapshot = parseSnapshot(open.materialSnapshot);
    if (snapshot.slug !== undefined) cell.slug = snapshot.slug;
    if (snapshot.name !== undefined) cell.name = snapshot.name;
    if (snapshot.description !== undefined) cell.description = snapshot.description;
    if (snapshot.tagline !== undefined) cell.tagline = snapshot.tagline ?? null;
    if (snapshot.seoTitle !== undefined) cell.seoTitle = snapshot.seoTitle ?? null;
    if (snapshot.seoDescription !== undefined) cell.seoDescription = snapshot.seoDescription ?? null;
    if (snapshot.seoCanonical !== undefined) cell.seoCanonical = snapshot.seoCanonical ?? null;
    if (snapshot.isFeatured !== undefined) cell.isFeatured = snapshot.isFeatured;
    if (snapshot.featuredOrder !== undefined) cell.featuredOrder = snapshot.featuredOrder;
    if (snapshot.displayOrder !== undefined) cell.displayOrder = snapshot.displayOrder;
    cell.draft = { revisionId: open.id, revisionNumber: open.revisionNumber, status: open.status };
  }
  return view;
}

type CreateInput = AdminCollectionCreateInput | AdminApplicationCreateInput;

export async function createAdminTaxonomy(kind: TaxonomyKind, input: CreateInput, actorId: string): Promise<AdminTaxonomy> {
  await assertSlugAvailable('tr', input.tr.slug);
  await assertSlugAvailable('en', input.en.slug);

  const item = await prisma.contentItem.create({
    data: {
      type: kind,
      aggregateState: 'DRAFT',
      ...(kind === 'COLLECTION' ? { collection: { create: {} } } : { application: { create: {} } }),
      variants: {
        create: [variantCreateData('tr', input.tr), variantCreateData('en', input.en)],
      },
    },
    include: { variants: { orderBy: { locale: 'asc' as const } } },
  });

  for (const variant of item.variants) {
    const localeInput = variant.locale === 'en' ? input.en : input.tr;
    const created = await prisma.contentRevision.create({
      data: {
        contentVariantId: variant.id,
        authorId: actorId,
        revisionNumber: 1,
        status: 'DRAFT',
        materialSnapshot: JSON.stringify(snapshotInput(localeInput)),
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

  return getAdminTaxonomy(kind, item.id);
}

type UpdateInput = AdminCollectionUpdateInput | AdminApplicationUpdateInput;

export async function updateAdminTaxonomy(
  kind: TaxonomyKind,
  id: string,
  input: UpdateInput,
  actorId: string
): Promise<AdminTaxonomy> {
  const item = await findItemOrThrow(kind, id);
  const typed = item as unknown as ItemWithVariants;

  if (input.tr?.slug) {
    await assertSlugAvailable('tr', input.tr.slug, id);
  }
  if (input.en?.slug) {
    await assertSlugAvailable('en', input.en.slug, id);
  }

  for (const locale of ['tr', 'en'] as const) {
    const patch = input[locale];
    const variant = typed.variants.find((v) => v.locale === locale);
    if (!variant) continue;

    if (variant.lifecycleState === 'PUBLISHED') {
      const draft = await ensureDraftRevision(variant.id, actorId);
      const snapshotPatch: DraftSnapshot = {};
      if (patch) {
        for (const key of ['slug', 'name', 'description', 'tagline', 'seoTitle', 'seoDescription', 'seoCanonical', 'isFeatured', 'featuredOrder', 'displayOrder'] as const) {
          if (patch[key] !== undefined) {
            (snapshotPatch as Record<string, unknown>)[key] = patch[key];
          }
        }
      }
      if (Object.keys(snapshotPatch).length > 0) {
        await patchDraftSnapshot(draft.id, snapshotPatch, actorId, [kind]);
      }
      continue;
    }

    if (patch && Object.keys(patch).length > 0) {
      await prisma.contentVariant.update({
        where: { id: variant.id },
        data: {
          ...(patch.slug !== undefined ? { slug: patch.slug } : {}),
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.tagline !== undefined ? { tagline: patch.tagline } : {}),
          ...(patch.seoTitle !== undefined ? { seoTitle: patch.seoTitle } : {}),
          ...(patch.seoDescription !== undefined ? { seoDescription: patch.seoDescription } : {}),
          ...(patch.seoCanonical !== undefined ? { seoCanonical: patch.seoCanonical } : {}),
          ...(patch.isFeatured !== undefined ? { isFeatured: patch.isFeatured } : {}),
          ...(patch.featuredOrder !== undefined ? { featuredOrder: patch.featuredOrder } : {}),
          ...(patch.displayOrder !== undefined ? { displayOrder: patch.displayOrder } : {}),
        },
      });
      const open = await findOpenRevision(variant.id);
      if (open && open.status === 'DRAFT') {
        const snapshotPatch: DraftSnapshot = {};
        for (const key of ['slug', 'name', 'description', 'tagline', 'seoTitle', 'seoDescription', 'seoCanonical', 'isFeatured', 'featuredOrder', 'displayOrder'] as const) {
          if (patch[key] !== undefined) {
            (snapshotPatch as Record<string, unknown>)[key] = patch[key];
          }
        }
        if (Object.keys(snapshotPatch).length > 0) {
          await patchDraftSnapshot(open.id, snapshotPatch, actorId, [kind]);
        }
      }
    }
  }

  await writeAudit(actorId, KINDS[kind].updateAction, id, {
    patchedLocales: ['tr', 'en'].filter((l) => input[l as 'tr' | 'en']),
  });

  return getAdminTaxonomy(kind, id);
}

export async function deleteAdminTaxonomy(kind: TaxonomyKind, id: string, actorId: string) {
  const item = await findItemOrThrow(kind, id);
  const typed = item as unknown as ItemWithVariants;
  const tr = typed.variants.find((v) => v.locale === 'tr');
  // Junction rows cascade per schema; Products are never touched.
  await writeAudit(actorId, KINDS[kind].deleteAction, id, {
    trSlug: tr?.slug ?? null,
    name: tr?.name ?? null,
  });
  await prisma.contentItem.delete({ where: { id } });
  return { deleted: true as const, id };
}

// ============================================================
// Product relationships (existing junctions)
// ============================================================

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

export async function listRelatedProducts(kind: TaxonomyKind, id: string): Promise<AttachedProduct[]> {
  await findItemOrThrow(kind, id);
  if (kind === 'COLLECTION') {
    const rows = await prisma.productCollection.findMany({
      where: { collectionId: id },
      include: { product: { include: { contentItem: { include: { variants: true } } } } },
      orderBy: { createdAt: 'asc' },
    });
    return rows.map((r) => {
      const variants = r.product.contentItem.variants;
      const tr = variants.find((v) => v.locale === 'tr');
      const en = variants.find((v) => v.locale === 'en');
      return {
        id: r.productId,
        trName: tr?.name ?? null,
        trSlug: tr?.slug ?? null,
        enName: en?.name ?? null,
        attachedAt: r.createdAt.toISOString(),
      };
    });
  }
  const rows = await prisma.productApplication.findMany({
    where: { applicationId: id },
    include: { product: { include: { contentItem: { include: { variants: true } } } } },
    orderBy: { createdAt: 'asc' },
  });
  return rows.map((r) => {
    const variants = r.product.contentItem.variants;
    const tr = variants.find((v) => v.locale === 'tr');
    const en = variants.find((v) => v.locale === 'en');
    return {
      id: r.productId,
      trName: tr?.name ?? null,
      trSlug: tr?.slug ?? null,
      enName: en?.name ?? null,
      attachedAt: r.createdAt.toISOString(),
    };
  });
}

export async function attachRelatedProduct(kind: TaxonomyKind, id: string, productId: string, actorId: string) {
  await findItemOrThrow(kind, id);
  await findProductOrThrow(productId);
  if (kind === 'COLLECTION') {
    const existing = await prisma.productCollection.findUnique({
      where: { productId_collectionId: { productId, collectionId: id } },
    });
    if (existing) {
      throw new ConflictError('Product is already attached to this collection.');
    }
    await prisma.productCollection.create({ data: { productId, collectionId: id } });
  } else {
    const existing = await prisma.productApplication.findUnique({
      where: { productId_applicationId: { productId, applicationId: id } },
    });
    if (existing) {
      throw new ConflictError('Product is already attached to this application.');
    }
    await prisma.productApplication.create({ data: { productId, applicationId: id } });
  }
  await writeAudit(actorId, KINDS[kind].attachAction, id, { productId });
  return listRelatedProducts(kind, id);
}

export async function detachRelatedProduct(kind: TaxonomyKind, id: string, productId: string, actorId: string) {
  await findItemOrThrow(kind, id);
  const removed =
    kind === 'COLLECTION'
      ? await prisma.productCollection.deleteMany({ where: { productId, collectionId: id } })
      : await prisma.productApplication.deleteMany({ where: { productId, applicationId: id } });
  if (removed.count === 0) {
    throw new NotFoundError('Product is not attached.');
  }
  await writeAudit(actorId, KINDS[kind].detachAction, id, { productId });
  return { detached: true as const };
}
