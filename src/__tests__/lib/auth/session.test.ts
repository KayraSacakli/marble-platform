import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createHash } from 'node:crypto';
import {
  createAdminSession,
  getAdminSessionUser,
  requireAdminSession,
  requireAdminRole,
} from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminSession: {
      create: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

function mockCookie(token: string | undefined) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === 'mp_admin_session' && token ? { value: token } : undefined),
  } as never);
}

function sessionRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 's-1',
    expiresAt: new Date(Date.now() + 60_000),
    user: {
      id: 'u-1',
      email: 'admin@marble-platform.local',
      name: 'Admin',
      isActive: true,
      roles: [{ role: { name: 'ADMIN' } }],
    },
    ...overrides,
  };
}

describe('getAdminSessionUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns null without a cookie', async () => {
    mockCookie(undefined);
    await expect(getAdminSessionUser()).resolves.toBeNull();
  });

  it('returns null for an unknown token', async () => {
    mockCookie('bogus');
    vi.mocked(prisma.adminSession.findUnique).mockResolvedValue(null);
    await expect(getAdminSessionUser()).resolves.toBeNull();
  });

  it('returns the user with roles and never the password hash', async () => {
    mockCookie('valid');
    vi.mocked(prisma.adminSession.findUnique).mockResolvedValue(sessionRow() as never);
    const user = await getAdminSessionUser();
    expect(user?.email).toBe('admin@marble-platform.local');
    expect(user?.roles).toEqual(['ADMIN']);
    expect(JSON.stringify(user)).not.toContain('passwordHash');
    // Password hashes must not even be selected.
    const args = vi.mocked(prisma.adminSession.findUnique).mock.calls[0][0];
    expect(JSON.stringify(args)).not.toContain('passwordHash');
  });

  it('rejects expired sessions', async () => {
    mockCookie('old');
    vi.mocked(prisma.adminSession.findUnique).mockResolvedValue(
      sessionRow({ expiresAt: new Date(Date.now() - 1000) }) as never
    );
    vi.mocked(prisma.adminSession.delete).mockResolvedValue({} as never);
    await expect(getAdminSessionUser()).resolves.toBeNull();
  });

  it('rejects inactive users', async () => {
    mockCookie('valid');
    const row = sessionRow();
    row.user.isActive = false;
    vi.mocked(prisma.adminSession.findUnique).mockResolvedValue(row as never);
    await expect(getAdminSessionUser()).resolves.toBeNull();
  });
});

describe('requireAdminSession / requireAdminRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requireAdminSession throws 401 without a session', async () => {
    mockCookie(undefined);
    await expect(requireAdminSession()).rejects.toMatchObject({ statusCode: 401 });
  });

  it('requireAdminRole is case-insensitive and rejects missing roles with 403', () => {
    const lower = { id: 'u', email: 'e', name: null, roles: ['admin'] };
    expect(() => requireAdminRole(lower, 'ADMIN')).not.toThrow();
    const editor = { id: 'u', email: 'e', name: null, roles: ['EDITOR'] };
    expect(() => requireAdminRole(editor, 'ADMIN')).toThrowError(
      expect.objectContaining({ statusCode: 403 })
    );
  });

  it('never trusts client-provided roles: roles come from the session user object', () => {
    // The helper only reads roles off the server-resolved user; there is no
    // code path that accepts role information from request input.
    const user = { id: 'u', email: 'e', name: null, roles: [] as string[] };
    expect(() => requireAdminRole(user, 'ADMIN', 'EDITOR')).toThrowError(
      expect.objectContaining({ statusCode: 403 })
    );
  });
});

describe('createAdminSession token entropy & rotation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.adminSession.create).mockResolvedValue({} as never);
  });

  it('issues a fresh 256-bit random token per login and persists only its sha256 hash', async () => {
    const first = await createAdminSession('u-1');
    const second = await createAdminSession('u-1');

    // randomBytes(32) rendered as hex → 64 hex chars = 256 bits of entropy.
    expect(first.token).toMatch(/^[0-9a-f]{64}$/);
    expect(second.token).toMatch(/^[0-9a-f]{64}$/);

    // Rotation: every login gets a fresh, unrelated token.
    expect(first.token).not.toBe(second.token);

    // Only the hash is stored — the raw token never reaches the database.
    const stored = vi.mocked(prisma.adminSession.create).mock.calls[0][0].data;
    expect(stored.tokenHash).toBe(createHash('sha256').update(first.token).digest('hex'));
    expect(stored.tokenHash).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(stored)).not.toContain(first.token);
    expect(stored.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });
});
