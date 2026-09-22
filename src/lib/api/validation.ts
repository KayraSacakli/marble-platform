import { z } from 'zod';
import { SUPPORTED_LOCALES, type Locale } from '@/types/locale';
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '@/types/api';
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
