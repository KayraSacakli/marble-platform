/**
 * Seed-time admin password policy.
 *
 * Extracted from prisma/seed.ts so it can be unit-tested: in production a
 * known default password must NEVER be used (and an existing admin password
 * must never be silently reset to it). See ensureDevAdmin in prisma/seed.ts.
 */

export const DEV_ADMIN_DEFAULT_PASSWORD = 'Admin123!ChangeMe';
export const MIN_SEED_ADMIN_PASSWORD_LENGTH = 12;

export type SeedAdminPasswordResolution =
  | { action: 'skip'; reason: string }
  | { action: 'use'; password: string; isDefault: boolean };

/**
 * Decide which password (if any) seed should provision admin/editor logins
 * with.
 *
 * - production + no usable configured password -> skip provisioning entirely
 * - otherwise -> configured password if long enough, else the documented
 *   development default (development only, clearly logged).
 */
export function resolveSeedAdminPassword(
  configured: string | undefined,
  isProduction: boolean
): SeedAdminPasswordResolution {
  const usable = configured && configured.length >= MIN_SEED_ADMIN_PASSWORD_LENGTH ? configured : null;

  if (!usable) {
    if (isProduction) {
      return {
        action: 'skip',
        reason: `SEED_ADMIN_PASSWORD is missing or shorter than ${MIN_SEED_ADMIN_PASSWORD_LENGTH} characters`,
      };
    }
    return { action: 'use', password: DEV_ADMIN_DEFAULT_PASSWORD, isDefault: true };
  }

  return { action: 'use', password: usable, isDefault: false };
}
