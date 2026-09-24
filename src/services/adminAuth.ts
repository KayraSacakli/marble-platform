import { prisma } from '@/lib/prisma';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { createAdminSession, type AdminSessionUser } from '@/lib/auth/session';
import { UnauthorizedError } from '@/lib/api/errors';

// Precomputed dummy hash so unknown-email logins cost ~the same as real
// verification (mitigates user-enumeration timing). The password behind it
// is a random value that is never used or stored anywhere.
const DUMMY_HASH =
  'scrypt$v1$n=16384$r=8$p=1$AAAAAAAAAAAAAAAAAAAAAA$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export interface AdminLoginResult {
  user: AdminSessionUser;
  token: string;
  expiresAt: Date;
}

function toSessionUser(user: {
  id: string;
  email: string;
  name: string | null;
  roles: Array<{ role: { name: string } }>;
}): AdminSessionUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles.map((r) => r.role.name),
  };
}

/**
 * Verify admin credentials and open a session.
 * Throws UnauthorizedError with a uniform message for unknown email,
 * inactive user, missing password, or wrong password (no enumeration).
 */
export async function loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
  const normalizedEmail = email.trim().toLowerCase();

  const user = await prisma.internalUser.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      name: true,
      isActive: true,
      passwordHash: true,
      roles: { select: { role: { select: { name: true } } } },
    },
  });

  if (!user || !user.isActive || !user.passwordHash) {
    // Burn comparable time even when the account does not exist.
    await verifyPassword(password, DUMMY_HASH);
    throw new UnauthorizedError('Invalid email or password.');
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password.');
  }

  const { token, expiresAt } = await createAdminSession(user.id);
  return { user: toSessionUser(user), token, expiresAt };
}

/** Re-hash helper for seeding/management tooling (never expose hashes). */
export async function createPasswordHash(password: string): Promise<string> {
  return hashPassword(password);
}
