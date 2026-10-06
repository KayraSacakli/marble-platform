import { notFound } from 'next/navigation';
import { isApiClientError } from './client-errors';

// ============================================================
// Prerender-safe 404 conversion (Phase 18D-2)
//
// Public pages fetch content through apiClient. A genuine upstream
// 404 means the slug does not exist and must become notFound().
// Any OTHER failure (network error, timeout, 5xx, unknown throw)
// means the data source is temporarily unavailable — during
// `next build` that must fail the build loudly instead of being
// silently baked into a static 404 page, and at runtime it must
// surface as an error instead of a fake 404.
// ============================================================

/**
 * Convert a genuine upstream 404 into notFound(); rethrow everything
 * else unchanged. Declared `never` so TypeScript keeps the
 * definitely-assigned analysis of `let x; try { x = ... } catch` intact.
 */
export function notFoundOnlyWhenMissing(error: unknown): never {
  if (isApiClientError(error) && error.isNotFound) {
    notFound();
  }
  throw error;
}
