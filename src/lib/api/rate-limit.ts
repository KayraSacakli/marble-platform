import { RateLimitError } from './errors';

// ============================================================
// In-process rate limiting (Phase 18D-1)
//
// Single-instance, fixed-window counters held in module scope.
// No Redis or other external dependency — by design for this phase.
//
// IP strategy / trust assumptions:
// - The client key is the LAST entry of `x-forwarded-for`, then
//   `x-real-ip`, then the literal `unknown`.
// - Next.js backfills a missing `x-forwarded-for` from the TCP peer
//   address (next/dist/server/base-server.js), so on a direct
//   deployment the header reflects the real socket address.
// - Behind a single reverse proxy that APPENDS the connecting address
//   (e.g. nginx `$proxy_add_x_forwarded_for`), the last entry is the
//   address the proxy observed and cannot be forged by the client.
//   Taking the last entry is therefore the fail-closed choice for
//   this deployment model.
// - Known limitations, accepted for this phase and documented rather
//   than papered over: (a) if the app is directly reachable AND the
//   client sends its own X-Forwarded-For, Next.js keeps the client
//   value (backfill only applies when the header is absent) so a
//   client can rotate keys; (b) multi-hop proxy chains collapse to
//   the outermost hop (shared bucket). Both need a trusted-proxy
//   configuration at the proxy layer when one is introduced.
//
// Memory: the store is hard-capped at MAX_BUCKETS entries. Expired
// entries are swept when the cap is reached and the oldest entries
// are evicted as a last resort, so a flood of unique keys cannot grow
// the map without bound.
// Expiration: fixed window per key (`resetAt`); a lapsed window is
// reset in place on the next use and swept physically at the cap.
// Concurrency: check-and-increment runs synchronously with no `await`
// in between, so concurrent requests in this single Node process
// cannot interleave past the counter. This bounds correctness to one
// process (multi-instance deployments would need a shared store —
// explicitly out of scope for 18D-1).
// ============================================================

export interface RateLimitConfig {
  /** Bucket name — keys are namespaced per bucket so IP+endpoint never share a bucket. */
  bucket: string;
  limit: number;
  windowMs: number;
}

export const ADMIN_LOGIN_RATE_LIMIT: RateLimitConfig = {
  bucket: 'admin-login',
  limit: 5,
  windowMs: 60_000,
};

export const PUBLIC_QUOTE_RATE_LIMIT: RateLimitConfig = {
  bucket: 'public-quote',
  limit: 10,
  windowMs: 60_000,
};

const MAX_BUCKETS = 10_000;
const MAX_KEY_PART_LENGTH = 64;

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

/**
 * Best-effort client IP for rate-limit keying. See trust assumptions
 * in the module header before changing the extraction order.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    const entries = forwarded.split(',');
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i].trim();
      if (entry) {
        return entry.slice(0, MAX_KEY_PART_LENGTH);
      }
    }
  }
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) {
    return realIp.slice(0, MAX_KEY_PART_LENGTH);
  }
  return 'unknown';
}

function sweepExpired(now: number): void {
  for (const [key, bucket] of buckets) {
    if (now >= bucket.resetAt) {
      buckets.delete(key);
    }
  }
}

/**
 * Record one attempt against `config` for the request's IP.
 * Synchronous by contract: the read-modify-write must never cross an
 * `await`, otherwise concurrent requests could bypass the counter.
 */
export function checkRateLimit(
  config: RateLimitConfig,
  request: Request,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const key = `${config.bucket}|${getClientIp(request)}`;

  let bucket = buckets.get(key);
  if (bucket && now >= bucket.resetAt) {
    // Lapsed window: drop and re-create so insertion order reflects
    // window start (oldest-window-first eviction).
    buckets.delete(key);
    bucket = undefined;
  }
  if (!bucket) {
    if (buckets.size >= MAX_BUCKETS) {
      sweepExpired(now);
      while (buckets.size >= MAX_BUCKETS) {
        const oldest = buckets.keys().next().value;
        if (oldest === undefined) {
          break;
        }
        buckets.delete(oldest);
      }
    }
    bucket = { count: 0, resetAt: now + config.windowMs };
    buckets.set(key, bucket);
  }

  bucket.count += 1;
  if (bucket.count > config.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Throw a 429 RateLimitError when the limit is exhausted. Call this
 * as the FIRST statement of a handler — before validation, auth or
 * any side effect — so a limited request never partially executes.
 */
export function enforceRateLimit(config: RateLimitConfig, request: Request): void {
  const result = checkRateLimit(config, request);
  if (!result.allowed) {
    throw new RateLimitError(
      'Too many requests. Please try again later.',
      result.retryAfterSeconds,
    );
  }
}

/** Current number of live buckets — exposed for tests/diagnostics. */
export function rateLimitStoreSize(): number {
  return buckets.size;
}

/** Clear all buckets. Tests only. */
export function resetRateLimits(): void {
  buckets.clear();
}
