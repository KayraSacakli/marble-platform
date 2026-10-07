import { z } from 'zod';
import { SUPPORTED_LOCALES, type Locale } from '@/types/locale';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/types/api';
import { QUOTE_REQUEST_STATES } from '@/lib/admin/quote-state';
import { BadRequestError } from './errors';

// ============================================================
// Locale validation
// ============================================================

export const localeSchema = z.enum(SUPPORTED_LOCALES);
export type LocaleInput = z.infer<typeof localeSchema>;

export function parseLocale(value: string | undefined): Locale {
  const result = localeSchema.safeParse(value);
  if (!result.success) {
    throw new BadRequestError(`Invalid locale. Supported locales: ${SUPPORTED_LOCALES.join(', ')}`);
  }
  return result.data;
}

// ============================================================
// Slug validation
// ============================================================

export const slugSchema = z
  .string()
  .min(1, 'Slug is required.')
  .max(500, 'Slug must be 500 characters or fewer.')
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must contain only lowercase letters, numbers, and hyphens.');

// ============================================================
// Pagination validation
// ============================================================

export const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int('Page must be an integer.')
    .positive('Page must be a positive integer.')
    .default(1),
  pageSize: z.coerce
    .number()
    .int('Page size must be an integer.')
    .positive('Page size must be a positive integer.')
    .max(MAX_PAGE_SIZE, `Page size must be ${MAX_PAGE_SIZE} or fewer.`)
    .default(DEFAULT_PAGE_SIZE),
});

export type PaginationInput = z.infer<typeof paginationSchema>;

export function normalizePagination(input: PaginationInput): {
  page: number;
  pageSize: number;
  skip: number;
} {
  const page = Math.max(1, input.page);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, input.pageSize));
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip };
}

/**
 * Parse `page` / `pageSize` from a request's search params.
 *
 * Missing or empty values fall back to the schema defaults; anything
 * unparseable (non-numeric, out of range) raises a 400 instead of being
 * silently coerced to page 1.
 */
export function parsePagination(searchParams?: URLSearchParams | null): PaginationInput {
  const raw: Record<string, string> = {};
  const page = searchParams?.get('page');
  const pageSize = searchParams?.get('pageSize');
  if (page) raw.page = page;
  if (pageSize) raw.pageSize = pageSize;

  const result = paginationSchema.safeParse(raw);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new BadRequestError(issue ? issue.message : 'Invalid pagination parameters.');
  }
  return result.data;
}

export function buildPaginationMeta(
  page: number,
  pageSize: number,
  total: number
): { page: number; pageSize: number; total: number; totalPages: number } {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize),
  };
}

// ============================================================
// Quote request validation
// ============================================================

export const quoteRequestSchema = z.object({
  contactName: z
    .string()
    .min(1, 'Name is required.')
    .max(300, 'Name must be 300 characters or fewer.'),
  contactEmail: z
    .string()
    .email('A valid email address is required.')
    .max(300, 'Email must be 300 characters or fewer.'),
  contactPhone: z
    .string()
    .max(50, 'Phone must be 50 characters or fewer.')
    .optional(),
  company: z
    .string()
    .max(300, 'Company must be 300 characters or fewer.')
    .optional(),
  message: z
    .string()
    .min(1, 'Message is required.')
    .max(5000, 'Message must be 5000 characters or fewer.'),
  context: z
    .object({
      contextKind: z.enum(['PRODUCT', 'PROJECT', 'APPLICATION']),
      productId: z.string().uuid().optional(),
      projectId: z.string().uuid().optional(),
      applicationId: z.string().uuid().optional(),
    })
    .optional(),
});

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

/**
 * Admin status update. Strict: only `state` may be supplied — submitted
 * customer data can never be modified through the admin API.
 */
export const adminQuoteStateUpdateSchema = z
  .object({
    state: z.enum(QUOTE_REQUEST_STATES),
  })
  .strict();

export type AdminQuoteStateUpdateInput = z.infer<typeof adminQuoteStateUpdateSchema>;

// ============================================================
// Admin auth
// ============================================================

export const adminLoginSchema = z.object({
  email: z
    .string()
    .email('A valid email address is required.')
    .max(300, 'Email must be 300 characters or fewer.'),
  password: z
    .string()
    .min(1, 'Password is required.')
    .max(500, 'Password must be 500 characters or fewer.'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

// ============================================================
// Admin content management (products, collections, applications)
// ============================================================

export const SEO_ROBOTS_VALUES = ['INDEX', 'NOINDEX', 'FOLLOW', 'NOFOLLOW'] as const;
export type SeoRobotsValue = (typeof SEO_ROBOTS_VALUES)[number];

export const adminContentVariantSchema = z.object({
  slug: slugSchema,
  name: z
    .string()
    .min(1, 'Name is required.')
    .max(500, 'Name must be 500 characters or fewer.'),
  description: z.string().max(20000, 'Description must be 20000 characters or fewer.').optional(),
  tagline: z.string().max(500, 'Tagline must be 500 characters or fewer.').optional(),
  seoTitle: z.string().max(500, 'SEO title must be 500 characters or fewer.').optional(),
  seoDescription: z.string().max(1000, 'SEO description must be 1000 characters or fewer.').optional(),
  seoCanonical: z.string().max(1000, 'Canonical URL must be 1000 characters or fewer.').optional(),
  seoRobots: z.enum(SEO_ROBOTS_VALUES).optional(),
  isFeatured: z.boolean().optional(),
  featuredOrder: z.number().int().min(0).max(100000).nullable().optional(),
  displayOrder: z.number().int().min(0).max(100000).nullable().optional(),
});

const adminProductExtensionSchema = z.object({
  internalIdentifier: z.string().max(100, 'Identifier must be 100 characters or fewer.').optional(),
  surfaceFinish: z.string().max(500).optional(),
  dimensions: z.string().max(500).optional(),
  format: z.string().max(500).optional(),
  origin: z.string().max(500).optional(),
  applicableStandards: z.string().max(500).optional(),
});

// Every supported locale may carry its own variant. TR and EN are always
// required on create (the admin UI only edits those two today); the remaining
// locales are optional so API clients can seed them ahead of the UI.
const createLocaleVariantSchemas = {
  tr: adminContentVariantSchema,
  en: adminContentVariantSchema,
  es: adminContentVariantSchema.optional(),
  fr: adminContentVariantSchema.optional(),
  de: adminContentVariantSchema.optional(),
  it: adminContentVariantSchema.optional(),
  ar: adminContentVariantSchema.optional(),
};

const updateLocaleVariantSchemas = {
  tr: adminContentVariantSchema.partial().optional(),
  en: adminContentVariantSchema.partial().optional(),
  es: adminContentVariantSchema.partial().optional(),
  fr: adminContentVariantSchema.partial().optional(),
  de: adminContentVariantSchema.partial().optional(),
  it: adminContentVariantSchema.partial().optional(),
  ar: adminContentVariantSchema.partial().optional(),
};

export const adminProductCreateSchema = adminProductExtensionSchema.extend({
  ...createLocaleVariantSchemas,
});

export const adminProductUpdateSchema = adminProductExtensionSchema.extend({
  ...updateLocaleVariantSchemas,
});

export type AdminProductCreateInput = z.infer<typeof adminProductCreateSchema>;
export type AdminProductUpdateInput = z.infer<typeof adminProductUpdateSchema>;
export type AdminProductVariantInput = z.infer<typeof adminContentVariantSchema>;

// Collections and Applications share the variant shape (no extension table).
export const adminCollectionCreateSchema = z.object({
  ...createLocaleVariantSchemas,
});

export const adminCollectionUpdateSchema = z.object({
  ...updateLocaleVariantSchemas,
});

export const adminApplicationCreateSchema = z.object({
  ...createLocaleVariantSchemas,
});

export const adminApplicationUpdateSchema = z.object({
  ...updateLocaleVariantSchemas,
});

export type AdminCollectionCreateInput = z.infer<typeof adminCollectionCreateSchema>;
export type AdminCollectionUpdateInput = z.infer<typeof adminCollectionUpdateSchema>;
export type AdminApplicationCreateInput = z.infer<typeof adminApplicationCreateSchema>;
export type AdminApplicationUpdateInput = z.infer<typeof adminApplicationUpdateSchema>;

export const adminRelationAttachSchema = z.object({
  productId: z.string().uuid('Invalid product id.'),
});

export type AdminRelationAttachInput = z.infer<typeof adminRelationAttachSchema>;

// ============================================================
// Admin project / journal management
// ============================================================

export const adminProjectCreateSchema = z.object({
  location: z.string().max(500, 'Location must be 500 characters or fewer.').optional(),
  projectType: z.string().max(200, 'Project type must be 200 characters or fewer.').optional(),
  ...createLocaleVariantSchemas,
});

export const adminProjectUpdateSchema = z.object({
  location: z.string().max(500, 'Location must be 500 characters or fewer.').optional(),
  projectType: z.string().max(200, 'Project type must be 200 characters or fewer.').optional(),
  ...updateLocaleVariantSchemas,
});

const isoDateString = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), 'Invalid publication date.');

export const adminJournalCreateSchema = z.object({
  publicationDate: isoDateString,
  authorName: z.string().max(300, 'Author name must be 300 characters or fewer.').optional(),
  ...createLocaleVariantSchemas,
});

export const adminJournalUpdateSchema = z.object({
  publicationDate: isoDateString.optional(),
  authorName: z.string().max(300, 'Author name must be 300 characters or fewer.').optional(),
  ...updateLocaleVariantSchemas,
});

export type AdminProjectCreateInput = z.infer<typeof adminProjectCreateSchema>;
export type AdminProjectUpdateInput = z.infer<typeof adminProjectUpdateSchema>;
export type AdminJournalCreateInput = z.infer<typeof adminJournalCreateSchema>;
export type AdminJournalUpdateInput = z.infer<typeof adminJournalUpdateSchema>;

export const adminJournalReferenceSchema = z.object({
  targetKind: z.enum(['product', 'application', 'project']),
  targetId: z.string().uuid('Invalid target id.'),
});

export type AdminJournalReferenceInput = z.infer<typeof adminJournalReferenceSchema>;

/** Flatten a ZodError into the project's API error details shape. */
export function toValidationDetails(error: {
  flatten: () => { fieldErrors: Record<string, unknown> };
}) {
  return Object.entries(error.flatten().fieldErrors).flatMap(([field, messages]) =>
    ((messages as string[] | undefined) ?? []).map((message) => ({ field, code: 'INVALID', message }))
  );
}

// ============================================================
// Admin media management
// ============================================================

export const adminMediaAttachSchema = z.object({
  assetId: z.string().uuid('Invalid media id.'),
  role: z.enum(['PRIMARY', 'GALLERY', 'HERO']),
  altTr: z.string().max(500, 'Alt text must be 500 characters or fewer.').optional(),
  altEn: z.string().max(500, 'Alt text must be 500 characters or fewer.').optional(),
});

export const adminMediaReorderItemSchema = z.object({
  assetId: z.string().uuid('Invalid media id.'),
  displayOrder: z.number().int().min(0).max(100000).optional(),
  altTr: z.string().max(500, 'Alt text must be 500 characters or fewer.').optional(),
  altEn: z.string().max(500, 'Alt text must be 500 characters or fewer.').optional(),
});

export const adminMediaReorderSchema = z.object({
  items: adminMediaReorderItemSchema.array().min(1).max(100),
});

export type AdminMediaAttachInput = z.infer<typeof adminMediaAttachSchema>;
export type AdminMediaReorderInput = z.infer<typeof adminMediaReorderSchema>;

// ============================================================
// Query param helpers
// ============================================================

export function parseQueryInt(value: string | undefined, defaultValue: number): number {
  if (value === undefined) return defaultValue;
  const parsed = Number(value);
  if (Number.isNaN(parsed) || !Number.isInteger(parsed) || parsed < 1) {
    return defaultValue;
  }
  return parsed;
}

export function parseQueryString(value: string | undefined): string | undefined {
  if (value === undefined || value.trim() === '') return undefined;
  return value.trim();
}
