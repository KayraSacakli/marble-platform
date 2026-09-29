import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError } from '@/lib/api/errors';
import { writeAudit } from '@/services/adminAudit';
import {
  ensureDraftRevision,
  patchDraftSnapshot,
  findOpenRevision,
  parseSnapshot,
  snapshotFromVariant,
  type DraftSnapshot,
} from '@/services/adminWorkflow';
import { normalizePagination, buildPaginationMeta } from '@/lib/api/validation';
import type {
  AdminProductCreateInput,
  AdminProductUpdateInput,
  AdminProductVariantInput,
} from '@/lib/api/validation';

// ============================================================
// Admin product management (server-side, session-guarded callers)
// ============================================================

export interface AdminProductVariant {
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
  /** Present when an unpublished draft/in-review/approved revision overlays the row. */
  draft: { revisionId: string; revisionNumber: number; status: string } | null;
}

export interface AdminProduct {
  id: string;
  aggregateState: string;
  internalIdentifier: string | null;
  surfaceFinish: string | null;
  dimensions: string | null;
  format: string | null;
  origin: string | null;
  applicableStandards: string | null;
  createdAt: string;
  updatedAt: string;
  tr: AdminProductVariant | null;
  en: AdminProductVariant | null;
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

type ProductWithVariants = {
  id: string;
  aggregateState: string;
  createdAt: Date;
  updatedAt: Date;
  product: {
    internalIdentifier: string | null;
    surfaceFinish: string | null;
    dimensions: string | null;
    format: string | null;
    origin: string | null;
    applicableStandards: string | null;
  } | null;
  variants: VariantRow[];
};

function toAdminProduct(item: ProductWithVariants): AdminProduct {
  const byLocale = (locale: string): AdminProductVariant | null => {
    const v = item.variants.find((variant) => variant.locale === locale);
    if (!v) return null;
    return {
      id: v.id,
      locale: v.locale,
      slug: v.slug,
      name: v.name,
      description: v.description,
      tagline: v.tagline,
      seoTitle: v.seoTitle,
      seoDescription: v.seoDescription,
      seoCanonical: v.seoCanonical,
      isFeatured: v.isFeatured,
      featuredOrder: v.featuredOrder,
      displayOrder: v.displayOrder,
      lifecycleState: v.lifecycleState,
      draft: null,
    };
  };
  return {
    id: item.id,
    aggregateState: item.aggregateState,
    internalIdentifier: item.product?.internalIdentifier ?? null,
    surfaceFinish: item.product?.surfaceFinish ?? null,
    dimensions: item.product?.dimensions ?? null,
    format: item.product?.format ?? null,
    origin: item.product?.origin ?? null,
    applicableStandards: item.product?.applicableStandards ?? null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    tr: byLocale('tr'),
    en: byLocale('en'),
  };
}

const productInclude = {
  product: true,
  variants: { orderBy: { locale: 'asc' as const } },
};

async function assertSlugAvailable(locale: string, slug: string, excludeContentItemId?: string): Promise<void> {
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

function variantData(
  locale: 'tr' | 'en',
  input: AdminProductVariantInput,
  isNew: boolean,
  lifecycleState: 'PUBLISHED' | 'DRAFT' = 'PUBLISHED'
) {
  return {
    locale,
    lifecycleState,
    slug: input.slug,
    name: input.name,
    description: input.description ?? (isNew ? '' : undefined),
    tagline: input.tagline ?? undefined,
    seoTitle: input.seoTitle ?? undefined,
    seoDescription: input.seoDescription ?? undefined,
    seoCanonical: input.seoCanonical ?? undefined,
    isFeatured: input.isFeatured ?? (isNew ? false : undefined),
    featuredOrder: input.featuredOrder ?? undefined,
    displayOrder: input.displayOrder ?? undefined,
  };
}

function extensionData(input: { internalIdentifier?: string; surfaceFinish?: string; dimensions?: string; format?: string; origin?: string; applicableStandards?: string }) {
  const data: Record<string, string | undefined> = {};
  for (const key of ['internalIdentifier', 'surfaceFinish', 'dimensions', 'format', 'origin', 'applicableStandards'] as const) {
    if (input[key] !== undefined) {
      data[key] = input[key] === '' ? undefined : input[key];
    }
  }
  return data;
}

async function findProductItemOrThrow(id: string) {
  const item = await prisma.contentItem.findUnique({
    where: { id },
    include: productInclude,
  });
  if (!item || item.type !== 'PRODUCT') {
    throw new NotFoundError('Product not found.');
  }
  return item;
}

export async function listAdminProducts(options: { page?: number; pageSize?: number; q?: string }) {
  const { page, pageSize, skip } = normalizePagination({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
  });
  const q = options.q?.trim();
  const where = {
    type: 'PRODUCT' as const,
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
      include: productInclude,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.contentItem.count({ where }),
  ]);
  return {
    data: items.map((item) => toAdminProduct(item as unknown as ProductWithVariants)),
    meta: buildPaginationMeta(page, pageSize, total),
  };
}

export async function getAdminProduct(id: string): Promise<AdminProduct> {
  const item = await findProductItemOrThrow(id);
  const product = toAdminProduct(item as unknown as ProductWithVariants);
  // Overlay open (unpublished) draft snapshots so the editor sees the
  // pending content while the published row stays intact.
  for (const locale of ['tr', 'en'] as const) {
    const view = product[locale];
    if (!view) continue;
    const variant = (item as unknown as ProductWithVariants).variants.find((v) => v.locale === locale);
    if (!variant) continue;
    const open = await findOpenRevision(variant.id);
    if (!open || (open.status !== 'DRAFT' && open.status !== 'IN_REVIEW' && open.status !== 'APPROVED')) continue;
    const snapshot = parseSnapshot(open.materialSnapshot);
    if (snapshot.slug !== undefined) view.slug = snapshot.slug;
    if (snapshot.name !== undefined) view.name = snapshot.name;
    if (snapshot.description !== undefined) view.description = snapshot.description;
    if (snapshot.tagline !== undefined) view.tagline = snapshot.tagline ?? null;
    if (snapshot.seoTitle !== undefined) view.seoTitle = snapshot.seoTitle ?? null;
    if (snapshot.seoDescription !== undefined) view.seoDescription = snapshot.seoDescription ?? null;
    if (snapshot.seoCanonical !== undefined) view.seoCanonical = snapshot.seoCanonical ?? null;
    if (snapshot.isFeatured !== undefined) view.isFeatured = snapshot.isFeatured;
    if (snapshot.featuredOrder !== undefined) view.featuredOrder = snapshot.featuredOrder;
    if (snapshot.displayOrder !== undefined) view.displayOrder = snapshot.displayOrder;
    if (snapshot.product) {
      for (const key of ['internalIdentifier', 'surfaceFinish', 'dimensions', 'format', 'origin', 'applicableStandards'] as const) {
        if (snapshot.product[key] !== undefined) {
          (product as unknown as Record<string, unknown>)[key] = snapshot.product[key] ?? null;
        }
      }
    }
    view.draft = { revisionId: open.id, revisionNumber: open.revisionNumber, status: open.status };
  }
  return product;
}

export async function createAdminProduct(input: AdminProductCreateInput, actorId: string): Promise<AdminProduct> {
  await assertSlugAvailable('tr', input.tr.slug);
  await assertSlugAvailable('en', input.en.slug);

  const item = await prisma.contentItem.create({
    data: {
      type: 'PRODUCT',
      // New products start as DRAFT: invisible until an approved revision
      // is published through the workflow.
      aggregateState: 'DRAFT',
      product: { create: extensionData(input) },
      variants: {
        create: [variantData('tr', input.tr, true, 'DRAFT'), variantData('en', input.en, true, 'DRAFT')],
      },
    },
    include: {
      product: true,
      variants: { orderBy: { locale: 'asc' as const } },
    },
  });

  // Initial DRAFT revision per locale, snapshotted from the input.
  for (const variant of item.variants) {
    const localeInput = variant.locale === 'en' ? input.en : input.tr;
    const revisionNumber = 1;
    const created = await prisma.contentRevision.create({
      data: {
        contentVariantId: variant.id,
        authorId: actorId,
        revisionNumber,
        status: 'DRAFT',
        materialSnapshot: JSON.stringify(
          snapshotFromVariant(
            {
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
            },
            {
              product: {
                internalIdentifier: input.internalIdentifier ?? null,
                surfaceFinish: input.surfaceFinish ?? null,
                dimensions: input.dimensions ?? null,
                format: input.format ?? null,
                origin: input.origin ?? null,
                applicableStandards: input.applicableStandards ?? null,
              },
            }
          )
        ),
      },
    });
    await writeAudit(actorId, 'CONTENT_REVISION_CREATE', item.id, {
      variantId: variant.id,
      revisionId: created.id,
      revisionNumber,
      locale: variant.locale,
    });
  }

  await writeAudit(actorId, 'PRODUCT_CREATE', item.id, {
    trSlug: input.tr.slug,
    enSlug: input.en.slug,
    name: input.tr.name,
  });

  return getAdminProduct(item.id);
}

export async function updateAdminProduct(
  id: string,
  input: AdminProductUpdateInput,
  actorId: string
): Promise<AdminProduct> {
  const item = await findProductItemOrThrow(id);
  const typed = item as unknown as ProductWithVariants;

  if (input.tr?.slug) {
    await assertSlugAvailable('tr', input.tr.slug, id);
  }
  if (input.en?.slug) {
    await assertSlugAvailable('en', input.en.slug, id);
  }

  const extPatch: Record<string, string | null | undefined> = {};
  for (const key of ['internalIdentifier', 'surfaceFinish', 'dimensions', 'format', 'origin', 'applicableStandards'] as const) {
    if (input[key] !== undefined) {
      extPatch[key] = input[key] === '' ? null : input[key];
    }
  }
  const hasExtPatch = Object.keys(extPatch).length > 0;

  for (const locale of ['tr', 'en'] as const) {
    const patch = input[locale];
    const variant = typed.variants.find((v) => v.locale === locale);
    if (!variant) continue;

    if (variant.lifecycleState === 'PUBLISHED') {
      // Published rows are immutable: edits go to an open DRAFT revision.
      // ensureDraftRevision throws 409 when a revision is already in review.
      const draft = await ensureDraftRevision(variant.id, actorId);
      const snapshotPatch: DraftSnapshot = {};
      if (patch) {
        for (const key of ['slug', 'name', 'description', 'tagline', 'seoTitle', 'seoDescription', 'seoCanonical', 'isFeatured', 'featuredOrder', 'displayOrder'] as const) {
          if (patch[key] !== undefined) {
            (snapshotPatch as Record<string, unknown>)[key] = patch[key];
          }
        }
      }
      if (hasExtPatch) {
        snapshotPatch.product = { ...(snapshotPatch.product ?? {}), ...extPatch };
      }
      if (Object.keys(snapshotPatch).length > 0 || snapshotPatch.product) {
        await patchDraftSnapshot(draft.id, snapshotPatch, actorId);
      }
      continue;
    }

    // Never-published variants: write the row directly (still hidden).
    const ext = extensionData(input);
    if (Object.keys(ext).length > 0) {
      await prisma.product.update({ where: { contentItemId: id }, data: ext });
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
      // Keep the open draft snapshot (if any) in sync.
      const open = await findOpenRevision(variant.id);
      if (open && open.status === 'DRAFT') {
        const snapshotPatch: DraftSnapshot = {};
        for (const key of ['slug', 'name', 'description', 'tagline', 'seoTitle', 'seoDescription', 'seoCanonical', 'isFeatured', 'featuredOrder', 'displayOrder'] as const) {
          if (patch[key] !== undefined) {
            (snapshotPatch as Record<string, unknown>)[key] = patch[key];
          }
        }
        if (Object.keys(snapshotPatch).length > 0) {
          await patchDraftSnapshot(open.id, snapshotPatch, actorId);
        }
      }
    } else if (hasExtPatch) {
      const ext = extensionData(input);
      await prisma.product.update({ where: { contentItemId: id }, data: ext });
    }
  }

  await writeAudit(actorId, 'PRODUCT_UPDATE', id, { patchedLocales: ['tr', 'en'].filter((l) => input[l as 'tr' | 'en']) });

  const updated = await findProductItemOrThrow(id);
  void updated;
  return getAdminProduct(id);
}

export async function deleteAdminProduct(id: string, actorId: string): Promise<{ deleted: true; id: string }> {
  const item = await findProductItemOrThrow(id);
  const snapshot = toAdminProduct(item as unknown as ProductWithVariants);

  // Audit first (FK is SetNull, so the row survives the delete below).
  await writeAudit(actorId, 'PRODUCT_DELETE', id, {
    trSlug: snapshot.tr?.slug ?? null,
    enSlug: snapshot.en?.slug ?? null,
    name: snapshot.tr?.name ?? snapshot.en?.name ?? null,
  });

  await prisma.contentItem.delete({ where: { id } });
  return { deleted: true, id };
}
