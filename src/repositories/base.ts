import { prisma } from '@/lib/prisma';
import type { PrismaClient } from '@prisma/client';
import type { Locale } from '@/types/locale';
import type { PaginationInput } from '@/lib/api/validation';
import { normalizePagination, buildPaginationMeta } from '@/lib/api/validation';

// ============================================================
// Base repository
// ============================================================

export abstract class BaseRepository {
  protected readonly db: PrismaClient;

  constructor(db: PrismaClient = prisma) {
    this.db = db;
  }

  /**
   * Build the publication gate where clause for public content.
   * Ensures only published, approved, and locale-eligible content is returned.
   */
  protected publishedWhere(locale: Locale) {
    return {
      contentItem: {
        aggregateState: 'ACTIVE',
      },
      locale,
      lifecycleState: 'PUBLISHED' as const,
    };
  }

  /**
   * Build pagination meta from count and params.
   */
  protected buildMeta(total: number, pagination: { page: number; pageSize: number }) {
    return buildPaginationMeta(pagination.page, pagination.pageSize, total);
  }

  /**
   * Normalize and return pagination with skip offset.
   */
  protected normalizePagination(input: PaginationInput) {
    return normalizePagination(input);
  }
}
