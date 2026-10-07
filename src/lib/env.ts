// ============================================================
// Production environment validation (Phase 18D-2)
//
// Runs from next.config.ts, so it executes at BOTH:
//   - `next build`   (build time, NODE_ENV=production)
//   - `next start`   (server startup, NODE_ENV=production)
// and is a no-op under `next dev` (NODE_ENV=development), keeping the
// existing local .env workflow untouched.
//
// Rules (production only):
//   - DATABASE_URL          required, parseable, postgres(ql)://
//   - NEXT_PUBLIC_SITE_URL  required, absolute http(s) URL, not a
//                           placeholder host (example.com etc.)
//   - NEXTAUTH_SECRET       required, not a documented placeholder,
//                           at least 16 characters
//
// Failure throws with EVERY issue listed, so one run surfaces the
// full configuration delta instead of one variable at a time.
// ============================================================

export type EnvLike = Record<string, string | undefined>;

export interface EnvIssue {
  key: string;
  reason: string;
}

const PLACEHOLDER_HOST_PATTERNS: RegExp[] = [
  /^([a-z0-9-]+\.)*example\.(com|org|net|test|invalid)$/i,
];

const PLACEHOLDER_HOST_SUBSTRINGS = [
  'yourdomain',
  'your-site',
  'your_site',
  'placeholder',
  'changeme',
  'change-me',
  'replace-me',
];

const SECRET_PLACEHOLDERS = [
  'your-secret-here',
  'your-secret',
  'your-secret-key',
  'changeme',
  'change-me',
  'placeholder',
  'secret',
  'password',
];

const MIN_SECRET_LENGTH = 16;

function isPlaceholderHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (PLACEHOLDER_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
    return true;
  }
  return PLACEHOLDER_HOST_SUBSTRINGS.some((marker) => host.includes(marker));
}

function isPlaceholderSecret(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return SECRET_PLACEHOLDERS.includes(normalized);
}

/** Collect every production configuration problem without throwing. */
export function collectProductionEnvIssues(env: EnvLike): EnvIssue[] {
  const issues: EnvIssue[] = [];

  // --- DATABASE_URL ---
  const databaseUrl = env.DATABASE_URL?.trim();
  if (!databaseUrl) {
    issues.push({
      key: 'DATABASE_URL',
      reason: 'is required in production but is missing or empty',
    });
  } else {
    try {
      const parsed = new URL(databaseUrl);
      if (!/^postgres(ql)?:$/.test(parsed.protocol)) {
        issues.push({
          key: 'DATABASE_URL',
          reason: `must use a postgres:// or postgresql:// scheme (got "${parsed.protocol}//")`,
        });
      }
    } catch {
      issues.push({ key: 'DATABASE_URL', reason: 'is not a valid URL' });
    }
  }

  // --- NEXT_PUBLIC_SITE_URL ---
  const siteUrl = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) {
    issues.push({
      key: 'NEXT_PUBLIC_SITE_URL',
      reason: 'is required in production but is missing or empty',
    });
  } else {
    try {
      const parsed = new URL(siteUrl);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        issues.push({
          key: 'NEXT_PUBLIC_SITE_URL',
          reason: `must be an absolute http(s) URL (got "${parsed.protocol}//")`,
        });
      } else if (!parsed.hostname) {
        issues.push({ key: 'NEXT_PUBLIC_SITE_URL', reason: 'must include a hostname' });
      } else if (isPlaceholderHost(parsed.hostname)) {
        issues.push({
          key: 'NEXT_PUBLIC_SITE_URL',
          reason: `is a placeholder ("${parsed.hostname}") — set the real public origin`,
        });
      }
    } catch {
      issues.push({ key: 'NEXT_PUBLIC_SITE_URL', reason: 'is not a valid absolute URL' });
    }
  }

  // --- NEXTAUTH_SECRET (admin/auth secret of record, see .env.example) ---
  const secret = env.NEXTAUTH_SECRET?.trim();
  if (!secret) {
    issues.push({
      key: 'NEXTAUTH_SECRET',
      reason: 'is required in production but is missing or empty',
    });
  } else if (isPlaceholderSecret(secret)) {
    issues.push({
      key: 'NEXTAUTH_SECRET',
      reason: 'is a documented placeholder — generate a real secret (e.g. `openssl rand -hex 32`)',
    });
  } else if (secret.length < MIN_SECRET_LENGTH) {
    issues.push({
      key: 'NEXTAUTH_SECRET',
      reason: `must be at least ${MIN_SECRET_LENGTH} characters (got ${secret.length})`,
    });
  }

  return issues;
}

/** Throws with an aggregated, readable message when production env is invalid. */
export function validateProductionEnv(env: EnvLike = process.env): void {
  const issues = collectProductionEnvIssues(env);
  if (issues.length > 0) {
    const details = issues.map((issue) => `  - ${issue.key} ${issue.reason}`).join('\n');
    throw new Error(`Production environment validation failed:\n${details}`);
  }
}

/**
 * Entry point for next.config.ts: strict in production, no-op in
 * development so `next dev` and the existing .env keep working.
 */
export function validateEnv(env: EnvLike = process.env): void {
  if (env.NODE_ENV === 'production') {
    validateProductionEnv(env);
  }
}
