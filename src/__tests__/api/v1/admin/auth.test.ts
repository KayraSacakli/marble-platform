import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as LOGIN } from '@/app/api/v1/admin/auth/login/route';
import { POST as LOGOUT } from '@/app/api/v1/admin/auth/logout/route';
import { GET as ME } from '@/app/api/v1/admin/auth/me/route';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { loginAdmin } from '@/services/adminAuth';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { UnauthorizedError } from '@/lib/api/errors';

vi.mock('@/services/adminAuth', () => ({
  loginAdmin: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminSession: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

function postJson(url: string, body: unknown): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as never;
}

function routeCtx() {
  return { params: Promise.resolve({}) };
}

const adminUser = { id: 'u-1', email: 'admin@marble-platform.local', name: 'Admin', roles: ['ADMIN'] };
const editorUser = { id: 'u-2', email: 'editor@marble-platform.local', name: 'Editor', roles: ['EDITOR'] };
const plainUser = { id: 'u-3', email: 'plain@marble-platform.local', name: 'Plain', roles: [] };

function dbUser(user: { id: string; email: string; name: string; roles: string[] }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: true,
    roles: user.roles.map((name) => ({ role: { name } })),
  };
}

/** Drive the real session chain: cookie token + mocked DB session row. */
function mockSession(user: { id: string; email: string; name: string; roles: string[] } | null) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === 'mp_admin_session' && user ? { value: 'tok' } : undefined),
  } as never);
  vi.mocked(prisma.adminSession.findUnique).mockResolvedValue(
    user
      ? ({ id: 's-1', expiresAt: new Date(Date.now() + 60_000), user: dbUser(user) } as never)
      : null
  );
  vi.mocked(prisma.adminSession.delete).mockResolvedValue({} as never);
}

describe('POST /api/v1/admin/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('logs in with valid credentials and sets a secure session cookie', async () => {
    vi.mocked(loginAdmin).mockResolvedValue({ user: adminUser, token: 'raw-token', expiresAt: new Date() });

    const res = await LOGIN(postJson('http://localhost/api/v1/admin/auth/login', {
      email: 'admin@marble-platform.local',
      password: 'Admin123!ChangeMe',
    }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.user.email).toBe('admin@marble-platform.local');
    expect(json.data.user.roles).toEqual(['ADMIN']);
    expect(JSON.stringify(json)).not.toContain('passwordHash');

    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('mp_admin_session=raw-token');
    expect(setCookie).toMatch(/HttpOnly/i);
    expect(setCookie).toMatch(/SameSite=Lax/i);
    expect(setCookie).toMatch(/Max-Age=\d+/);
  });

  it('rejects invalid credentials with 401 and sets no cookie', async () => {
    vi.mocked(loginAdmin).mockRejectedValue(new UnauthorizedError('Invalid email or password.'));

    const res = await LOGIN(postJson('http://localhost/api/v1/admin/auth/login', {
      email: 'admin@marble-platform.local',
      password: 'wrong',
    }));
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(json.error.code).toBe('UNAUTHORIZED');
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('rejects invalid payload with 422', async () => {
    const res = await LOGIN(postJson('http://localhost/api/v1/admin/auth/login', { email: 'not-an-email' }));
    expect(res.status).toBe(422);
    expect(vi.mocked(loginAdmin)).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/admin/auth/logout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('clears the session for an authenticated user', async () => {
    mockSession(adminUser);

    const res = await LOGOUT(new Request('http://localhost/api/v1/admin/auth/logout', { method: 'POST' }) as never, routeCtx());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.loggedOut).toBe(true);
    expect(vi.mocked(prisma.adminSession.delete)).toHaveBeenCalled();
    expect(res.headers.get('set-cookie') ?? '').toMatch(/Max-Age=0/);
  });

  it('returns 401 without a session', async () => {
    mockSession(null);

    const res = await LOGOUT(new Request('http://localhost/api/v1/admin/auth/logout', { method: 'POST' }) as never, routeCtx());
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/admin/auth/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the session user without password material', async () => {
    mockSession(editorUser);

    const res = await ME(new Request('http://localhost/api/v1/admin/auth/me') as never, routeCtx());
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.user.email).toBe('editor@marble-platform.local');
    expect(JSON.stringify(json)).not.toContain('passwordHash');
  });

  it('returns 401 without a session', async () => {
    mockSession(null);

    const res = await ME(new Request('http://localhost/api/v1/admin/auth/me') as never, routeCtx());
    expect(res.status).toBe(401);
  });
});

describe('withAdminAuth role authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const okHandler = withAdminAuth(async () => ({ ok: true }), { roles: ['ADMIN'] });

  it('allows ADMIN', async () => {
    mockSession(adminUser);
    const res = await okHandler(new Request('http://localhost/api/v1/admin/x') as never, routeCtx());
    expect(res.status).toBe(200);
  });

  it('allows EDITOR only when the route permits it', async () => {
    mockSession(editorUser);
    const denied = await okHandler(new Request('http://localhost/api/v1/admin/x') as never, routeCtx());
    expect(denied.status).toBe(403);

    const editorHandler = withAdminAuth(async () => ({ ok: true }), { roles: ['ADMIN', 'EDITOR'] });
    const allowed = await editorHandler(new Request('http://localhost/api/v1/admin/x') as never, routeCtx());
    expect(allowed.status).toBe(200);
  });

  it('rejects role-less users with 403 and unauthenticated with 401', async () => {
    mockSession(plainUser);
    const forbidden = await okHandler(new Request('http://localhost/api/v1/admin/x') as never, routeCtx());
    expect(forbidden.status).toBe(403);
    expect((await forbidden.json()).error.code).toBe('FORBIDDEN');

    mockSession(null);
    const unauthorized = await okHandler(new Request('http://localhost/api/v1/admin/x') as never, routeCtx());
    expect(unauthorized.status).toBe(401);
    expect((await unauthorized.json()).error.code).toBe('UNAUTHORIZED');
  });
});
