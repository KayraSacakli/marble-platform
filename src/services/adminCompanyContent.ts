import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/api/errors';
import { writeAudit } from '@/services/adminAudit';
import { SUPPORTED_LOCALES, type Locale } from '@/types/locale';
import {
  getContentWorkflow,
  ensureDraftRevision,
  patchDraftSnapshot,
  type DraftSnapshot,
} from '@/services/adminWorkflow';
import type {
  AdminCompanyContentCreateInput,
  AdminCompanyContentUpdateInput,
  CompanyContentKind,
} from '@/lib/api/validation';

// ============================================================
// Admin company content (ABOUT / QUARRY / FACTORY)
//
// Company content is a ContentItem of type COMPANY_CONTENT with a
// CompanyContent(kind) row. It follows the same DRAFT → IN_REVIEW →
// APPROVED → PUBLISHED workflow as every other managed content type;
// this service only covers create/update/read, the workflow itself
// stays in adminWorkflow + /api/v1/admin/revisions/*.
// ============================================================

type VariantRow = {
  id: string;
  locale: string;
  lifecycleState: string;
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
};

type ItemWithVariants = {
  id: string;
  aggregateState: string;
  type: string;
  companyContent: { kind: CompanyContentKind } | null;
  variants: VariantRow[];
};

const itemInclude = {
  variants: { orderBy: { locale: 'asc' as const } },
  companyContent: { select: { kind: true } },
};

async function findItemOrThrow(kind: CompanyContentKind): Promise<ItemWithVariants> {
  const item = await prisma.contentItem.findFirst({
    where: { type: 'COMPANY_CONTENT', companyContent: { kind } },
    include: itemInclude,
  });
  if (!item) {
    throw new NotFoundError(`Company content (${kind}) not found.`);
  }
  return item as unknown as ItemWithVariants;
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
  seoRobots?: 'INDEX' | 'NOINDEX' | 'FOLLOW' | 'NOFOLLOW';
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

function snapshotInput(localeInput: VariantInput): DraftSnapshot {
  return {
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
}

function toView(item: ItemWithVariants) {
  const variants: Partial<Record<Locale, (VariantRow & { draft: null }) | undefined>> = {};
  for (const locale of SUPPORTED_LOCALES) {
    const v = item.variants.find((variant) => variant.locale === locale);
    if (!v) continue;
    variants[locale] = { ...v, draft: null };
  }
  return {
    id: item.id,
    kind: item.companyContent?.kind ?? null,
    aggregateState: item.aggregateState,
    tr: variants.tr ?? null,
    en: variants.en ?? null,
    variants,
  };
}

export async function getAdminCompanyContent(kind: CompanyContentKind) {
  const item = await findItemOrThrow(kind);
  return {
    content: toView(item),
    workflow: await getContentWorkflow(item.id, 'COMPANY_CONTENT'),
  };
}

export async function createAdminCompanyContent(
  kind: CompanyContentKind,
  input: AdminCompanyContentCreateInput,
  actorId: string,
) {
  const existing = await prisma.contentItem.findFirst({
    where: { type: 'COMPANY_CONTENT', companyContent: { kind } },
    select: { id: true },
  });
  if (existing) {
    throw new ConflictError(`Company content (${kind}) already exists. Update it instead.`);
  }

  const locales = SUPPORTED_LOCALES.filter((l) => input[l]);
  for (const locale of locales) {
    const localeInput = input[locale];
    if (!localeInput) continue;
    await assertSlugAvailable(locale, localeInput.slug);
  }

  const item = await prisma.contentItem.create({
    data: {
      type: 'COMPANY_CONTENT',
      aggregateState: 'DRAFT',
      companyContent: { create: { kind } },
      variants: {
        create: locales.flatMap((locale) => {
          const localeInput = input[locale];
          return localeInput ? [variantCreateData(locale, localeInput)] : [];
        }),
      },
    },
    include: itemInclude,
  });

  for (const variant of item.variants) {
    const localeInput = input[variant.locale as Locale];
    if (!localeInput) continue;
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

  await writeAudit(actorId, 'COMPANY_CONTENT_CREATE', item.id, {
    kind,
    trSlug: input.tr.slug,
    enSlug: input.en.slug,
    name: input.tr.name,
  });

  return getAdminCompanyContent(kind);
}

export async function updateAdminCompanyContent(
  kind: CompanyContentKind,
  input: AdminCompanyContentUpdateInput,
  actorId: string,
) {
  const item = await findItemOrThrow(kind);
  const locales = SUPPORTED_LOCALES.filter((l) => input[l]);
  if (locales.length === 0) {
    throw new ValidationError('No locale content supplied.', [
      { field: 'locale', code: 'INVALID', message: 'At least one locale is required.' },
    ]);
  }

  for (const locale of locales) {
    const localeInput = input[locale];
    if (!localeInput) continue;
    const variant = item.variants.find((v) => v.locale === locale);
    if (localeInput.slug !== undefined) {
      await assertSlugAvailable(locale, localeInput.slug, item.id);
    }
    if (!variant) {
      // Locale variant does not exist yet — create it in DRAFT with revision 1.
      if (!localeInput.slug || !localeInput.name) {
        throw new ValidationError('A slug and a name are required for a new locale variant.', [
          { field: `${locale}.slug`, code: 'INVALID', message: 'Slug and name are required.' },
        ]);
      }
      const created = await prisma.contentVariant.create({
        data: {
          contentItemId: item.id,
          ...variantCreateData(locale, localeInput as VariantInput),
        },
      });
      const revision = await prisma.contentRevision.create({
        data: {
          contentVariantId: created.id,
          authorId: actorId,
          revisionNumber: 1,
          status: 'DRAFT',
          materialSnapshot: JSON.stringify(
            snapshotInput({ slug: created.slug, name: created.name ?? '', ...localeInput }),
          ),
        },
      });
      await writeAudit(actorId, 'CONTENT_REVISION_CREATE', item.id, {
        variantId: created.id,
        revisionId: revision.id,
        revisionNumber: 1,
        locale,
      });
      continue;
    }
    const draft = await ensureDraftRevision(variant.id, actorId);
    await patchDraftSnapshot(draft.id, localeInput as DraftSnapshot, actorId, ['COMPANY_CONTENT']);
  }

  await writeAudit(actorId, 'COMPANY_CONTENT_UPDATE', item.id, {
    kind,
    locales,
  });

  return getAdminCompanyContent(kind);
}
