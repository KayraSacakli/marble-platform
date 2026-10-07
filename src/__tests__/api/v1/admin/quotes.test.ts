import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as LIST } from '@/app/api/v1/admin/quotes/route';
import { GET as DETAIL, PATCH as UPDATE } from '@/app/api/v1/admin/quotes/[id]/route';
import { POST as PUBLIC_POST } from '@/app/api/v1/public/[locale]/quote-requests/route';
import * as publicQuoteRoute from '@/app/api/v1/public/[locale]/quote-requests/route';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    quoteRequest: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    auditEvent: { create: vi.fn() },
    adminSession: { findUnique: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

vi.mock('@/services/content', () => ({
  contentService: { createQuoteRequest: vi.fn() },
}));

const { contentService } = await import('@/services/content');

const ADMIN = { id: 'u-admin', email: 'a@x.local', roles: ['ADMIN'] };
const EDITOR = { id: 'u-editor', email: 'e@x.local', roles: ['EDITOR'] };
const OUTSIDER = { id: 'u-view', email: 'v@x.local', roles: ['VIEWER'] };
const QUOTE_ID = '77777777-7777-4777-8777-777777777777';

function mockSession(user: { id: string; email: string; roles: string[] } | null) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === 'mp_admin_session' && user ? { value: 'tok' } : undefined),
  } as never);
  vi.mocked(prisma.adminSession.findUnique).mockResolvedValue(
    user
      ? ({
          id: 's-1',
          expiresAt: new Date(Date.now() + 60_000),
          user: {
            id: user.id,
            email: user.email,
            name: 'U',
            isActive: true,
            roles: user.roles.map((name) => ({ role: { name } })),
          },
        } as never)
      : null,
  );
}

function makeQuote(overrides: Record<string, unknown> = {}) {
  return {
    id: QUOTE_ID,
    contactName: 'Jane Doe',
    contactEmail: 'jane@example.invalid',
    contactPhone: '+90 555 000 00 00',
    company: 'Acme Marble',
    message: 'We need 200 m2 of ivory marble.',
    locale: 'tr',
    state: 'PENDING',
    processedById: null,
    submittedAt: new Date('2026-01-05T10:00:00Z'),
    processedAt: null,
    processor: null,
    context: null,
    ...overrides,
  };
}

/** Mock findUnique for both the state lookup (select) and the detail read (include). */
function mockQuoteLookup(state: string, detailOverrides: Record<string, unknown> = {}) {
  vi.mocked(prisma.quoteRequest.findUnique).mockImplementation(async (args: never) => {
    const a = args as { include?: unknown };
    if (a.include) return makeQuote({ state, ...detailOverrides }) as never;
    return { id: QUOTE_ID, state } as never;
  });
}

function req(url: string, method = 'GET', body?: unknown): Request {
  return new Request(url, {
    method,
    headers: body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  }) as never;
}

function ctx(params: Record<string, string> = {}) {
  return { params: Promise.resolve(params) };
}

const ROUTES = {
  list: (url = 'http://localhost/x') => LIST(req(url) as never, ctx()),
  detail: (id = QUOTE_ID) => DETAIL(req('http://localhost/x') as never, ctx({ id })),
  update: (id: string, body: unknown) =>
    UPDATE(req('http://localhost/x', 'PATCH', body) as never, ctx({ id })),
};

describe('admin quotes API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 unauthenticated for list, detail and status update', async () => {
    mockSession(null);
    expect((await ROUTES.list()).status).toBe(401);
    expect((await ROUTES.detail()).status).toBe(401);
    expect((await ROUTES.update(QUOTE_ID, { state: 'IN_REVIEW' })).status).toBe(401);
  });

  it('returns 403 for roles outside ADMIN/EDITOR', async () => {
    mockSession(OUTSIDER);
    expect((await ROUTES.list()).status).toBe(403);
    expect((await ROUTES.detail()).status).toBe(403);
    expect((await ROUTES.update(QUOTE_ID, { state: 'IN_REVIEW' })).status).toBe(403);
  });

  it('EDITOR can advance the lifecycle but cannot close', async () => {
    mockSession(EDITOR);
    vi.mocked(prisma.quoteRequest.update).mockResolvedValue({} as never);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);

    mockQuoteLookup('PENDING');
    const advanced = await ROUTES.update(QUOTE_ID, { state: 'IN_REVIEW' });
    expect(advanced.status).toBe(200);
    expect(vi.mocked(prisma.quoteRequest.update).mock.calls[0][0].data.state).toBe('IN_REVIEW');

    mockQuoteLookup('IN_REVIEW');
    expect((await ROUTES.update(QUOTE_ID, { state: 'RESPONDED' })).status).toBe(200);

    mockQuoteLookup('RESPONDED');
    const closeAttempt = await ROUTES.update(QUOTE_ID, { state: 'CLOSED' });
    expect(closeAttempt.status).toBe(403);
    expect(vi.mocked(prisma.quoteRequest.update)).toHaveBeenCalledTimes(2);
  });

  it('ADMIN full lifecycle persists state, stamps actor and audits without PII', async () => {
    mockSession(ADMIN);
    vi.mocked(prisma.quoteRequest.update).mockResolvedValue({} as never);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);

    for (const [from, to] of [
      ['PENDING', 'IN_REVIEW'],
      ['IN_REVIEW', 'RESPONDED'],
      ['RESPONDED', 'CLOSED'],
    ] as const) {
      mockQuoteLookup(from);
      const res = await ROUTES.update(QUOTE_ID, { state: to });
      expect(res.status).toBe(200);
    }

    const updates = vi.mocked(prisma.quoteRequest.update).mock.calls;
    expect(updates).toHaveLength(3);
    for (const call of updates) {
      const data = call[0].data as Record<string, unknown>;
      // Submitted customer data is never part of the update payload.
      expect(Object.keys(data).sort()).toEqual(['processedAt', 'processedById', 'state']);
      expect(data.processedById).toBe(ADMIN.id);
      expect(data.processedAt).toBeInstanceOf(Date);
    }

    const audits = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data);
    expect(audits).toHaveLength(3);
    expect(audits.map((a) => a.action)).toEqual([
      'QUOTE_STATE_UPDATE',
      'QUOTE_STATE_UPDATE',
      'QUOTE_STATE_UPDATE',
    ]);
    expect(audits.every((a) => a.contentItemId === null)).toBe(true);
    const first = JSON.parse(audits[0].details as string);
    expect(first).toEqual({ quoteId: QUOTE_ID, from: 'PENDING', to: 'IN_REVIEW' });
    const allDetails = audits.map((a) => a.details as string).join(' ');
    expect(allDetails).not.toContain('Jane');
    expect(allDetails).not.toContain('jane@example.invalid');
    expect(allDetails).not.toContain('ivory');
  });

  it('detail returns the full record for admins; unknown → 404; malformed → 400', async () => {
    mockSession(ADMIN);
    vi.mocked(prisma.quoteRequest.findUnique).mockResolvedValue(
      makeQuote({
        context: {
          contextKind: 'PRODUCT',
          productId: '555e8400-e29b-41d4-a716-446655440000',
          projectId: null,
          applicationId: null,
          product: {
            contentItem: { variants: [{ locale: 'tr', slug: 'ivory', name: 'Ivory Stone' }] },
          },
          project: null,
          application: null,
        },
      }) as never,
    );

    const res = await ROUTES.detail();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.contactEmail).toBe('jane@example.invalid');
    expect(json.data.contactPhone).toBe('+90 555 000 00 00');
    expect(json.data.message).toContain('ivory marble');
    expect(json.data.state).toBe('PENDING');
    expect(json.data.submittedAt).toBeDefined();
    expect(json.data.context.product.trName).toBe('Ivory Stone');

    vi.mocked(prisma.quoteRequest.findUnique).mockResolvedValue(null as never);
    expect((await ROUTES.detail()).status).toBe(404);
    expect((await ROUTES.detail('not-a-uuid')).status).toBe(400);
  });

  it('rejects invalid transitions, invalid input and unknown fields', async () => {
    mockSession(ADMIN);

    // Invalid jump in the lifecycle.
    mockQuoteLookup('PENDING');
    const jump = await ROUTES.update(QUOTE_ID, { state: 'CLOSED' });
    expect(jump.status).toBe(409);
    expect((await jump.json()).error.code).toBe('CONFLICT');
    expect(vi.mocked(prisma.quoteRequest.update)).not.toHaveBeenCalled();

    // Same-state no-op.
    mockQuoteLookup('IN_REVIEW');
    expect((await ROUTES.update(QUOTE_ID, { state: 'IN_REVIEW' })).status).toBe(409);

    // Unknown state value.
    expect((await ROUTES.update(QUOTE_ID, { state: 'HACKED' })).status).toBe(422);

    // Strict schema: submitted customer data cannot be modified.
    const pii = await ROUTES.update(QUOTE_ID, { state: 'IN_REVIEW', contactEmail: 'evil@x.local' });
    expect(pii.status).toBe(422);
    expect(vi.mocked(prisma.quoteRequest.update)).not.toHaveBeenCalled();

    // Malformed id.
    mockQuoteLookup('PENDING');
    expect((await ROUTES.update('not-a-uuid', { state: 'IN_REVIEW' })).status).toBe(400);
  });

  it('list is paginated, newest-first and withholds PII beyond name/company', async () => {
    mockSession(ADMIN);
    vi.mocked(prisma.quoteRequest.findMany).mockResolvedValue([
      {
        id: QUOTE_ID,
        contactName: 'Jane Doe',
        company: 'Acme Marble',
        state: 'PENDING',
        locale: 'tr',
        submittedAt: new Date('2026-01-05T10:00:00Z'),
      },
      {
        id: '88888888-8888-4888-8888-888888888888',
        contactName: 'John Roe',
        company: null,
        state: 'CLOSED',
        locale: 'en',
        submittedAt: new Date('2026-01-01T10:00:00Z'),
      },
    ] as never);
    vi.mocked(prisma.quoteRequest.count).mockResolvedValue(42);

    const res = await ROUTES.list('http://localhost/x?page=2&pageSize=10');
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.meta).toEqual({ page: 2, pageSize: 10, total: 42, totalPages: 5 });
    for (const item of json.data.data) {
      expect(item).not.toHaveProperty('contactEmail');
      expect(item).not.toHaveProperty('contactPhone');
      expect(item).not.toHaveProperty('message');
      expect(Object.keys(item).sort()).toEqual([
        'company',
        'contactName',
        'id',
        'locale',
        'state',
        'submittedAt',
      ]);
    }

    const listCall = vi.mocked(prisma.quoteRequest.findMany).mock.calls[0][0] as Record<
      string,
      unknown
    >;
    expect(listCall.orderBy).toEqual({ submittedAt: 'desc' });
    expect(listCall.skip).toBe(10);
    expect(listCall.take).toBe(10);
    expect(listCall.where).toEqual({});

    // State filter is validated server-side.
    expect((await ROUTES.list('http://localhost/x?state=NOPE')).status).toBe(400);

    await ROUTES.list('http://localhost/x?state=RESPONDED&q=acme');
    const listCalls = vi.mocked(prisma.quoteRequest.findMany).mock.calls;
    const filtered = listCalls[1][0] as Record<string, unknown>;
    expect(filtered.where).toEqual({
      state: 'RESPONDED',
      OR: [
        { contactName: { contains: 'acme', mode: 'insensitive' } },
        { company: { contains: 'acme', mode: 'insensitive' } },
      ],
    });
  });

  it('public quote API exposes no read endpoints and submission still works', async () => {
    expect(publicQuoteRoute.GET).toBeUndefined();
    expect(publicQuoteRoute.PATCH).toBeUndefined();
    expect(publicQuoteRoute.PUT).toBeUndefined();
    expect(publicQuoteRoute.DELETE).toBeUndefined();

    (contentService.createQuoteRequest as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: '99999999-9999-4999-8999-999999999999',
      submittedAt: new Date('2026-01-05T10:00:00Z'),
    });

    const res = await PUBLIC_POST(
      req('http://localhost/api/v1/public/tr/quote-requests', 'POST', {
        contactName: 'Jane Doe',
        contactEmail: 'jane@example.invalid',
        message: 'Need a quote.',
      }) as never,
      ctx({ locale: 'tr' }),
    );
    expect(res.status).toBe(200);
    expect(contentService.createQuoteRequest as ReturnType<typeof vi.fn>).toHaveBeenCalledTimes(1);
  });
});
