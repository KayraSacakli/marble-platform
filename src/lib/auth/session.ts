import { randomBytes, createHash } from 'node:crypto';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { UnauthorizedError, ForbiddenError } from '@/lib/api/errors';

// ============================================================
// Admin session (opaque tokens, httpOnly cookie)
// ============================================================

export const ADMIN_SESSION_COOKIE = 'mp_admin_session';

/** 12 hours in seconds / milliseconds. */
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;
const ADMIN_SESSION_TTL_MS = ADMIN_SESSION_TTL_SECONDS * 1000;

export interface AdminSessionUser {
  id: string;
  email: string;
  name: string | null;
  roles: string[];
}

function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function isSecureContext(): boolean {
  if (process.env.ADMIN_COOKIE_SECURE === '1') {
    return true;
  }
  if (process.env.ADMIN_COOKIE_SECURE === '0') {
    return false;
  }
  // Default: Secure in production, plain http allowed in development.
  return process.env.NODE_ENV === 'production';
}

export function buildSessionCookie(token: string, maxAgeSeconds: number): string {
  const parts = [
    `${ADMIN_SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (isSecureContext()) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

export function buildClearedSessionCookie(): string {
  const parts = [`${ADMIN_SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (isSecureContext()) {
    parts.push('Secure');
  }
  return parts.join('; ');
}

/**
 * Create a new admin session for an active user. Returns the raw token
 * (to be set as cookie) and its expiry. Only the hash is persisted.
 */
export async function createAdminSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_TTL_MS);
  await prisma.adminSession.create({
    data: { userId, tokenHash: hashToken(token), expiresAt },
  });
  return { token, expiresAt };
}

/** Delete the session identified by its raw token (logout). Never throws. */
export async function deleteAdminSessionByToken(token: string): Promise<void> {
  try {
    await prisma.adminSession.delete({ where: { tokenHash: hashToken(token) } });
  } catch {
    // Unknown/expired token — logout is still successful.
  }
}

/**
 * Resolve the current admin session user from the session cookie.
 * Identity and roles are always read server-side from the database —
 * never trust client-provided role information. Returns null when
 * there is no usable session. Password hashes are never selected.
 */
export async function getAdminSessionUser(): Promise<AdminSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          roles: { select: { role: { select: { name: true } } } },
        },
      },
    },
  });

  if (!session) {
    return null;
  }

  if (session.expiresAt.getTime() <= Date.now()) {
    try {
      await prisma.adminSession.delete({ where: { id: session.id } });
    } catch {
      // Already removed — treat as expired either way.
    }
    return null;
  }

  if (!session.user.isActive) {
    return null;
  }

  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    roles: session.user.roles.map((r) => r.role.name),
  };
}

/** Require an authenticated admin session user (401 otherwise). */
export async function requireAdminSession(): Promise<AdminSessionUser> {
  const user = await getAdminSessionUser();
  if (!user) {
    throw new UnauthorizedError('Admin authentication is required.');
  }
  return user;
}

export type AdminRole = 'ADMIN' | 'EDITOR';

/**
 * Require one of the given roles (403 otherwise).
 * Role membership comes from the database, not the client.
 */
export function requireAdminRole(user: AdminSessionUser, ...allowed: AdminRole[]): AdminSessionUser {
  const owned = user.roles.map((role) => role.toUpperCase());
  if (!allowed.some((role) => owned.includes(role))) {
    throw new ForbiddenError('You do not have permission to perform this action.');
  }
  return user;
}
