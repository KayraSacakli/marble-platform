import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as LIST, POST as CREATE } from '@/app/api/v1/admin/products/route';
import { GET as DETAIL, PATCH as UPDATE, DELETE as REMOVE } from '@/app/api/v1/admin/products/[id]/route';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contentItem: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn(), update: vi.fn() },
    contentVariant: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    contentRevision: { findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    contentMedia: { findMany: vi.fn() },
    product: { update: vi.fn() },
    approval: { create: vi.fn(), findFirst: vi.fn() },
    adminSession: { findUnique: vi.fn(), delete: vi.fn() },
    auditEvent: { create: vi.fn() },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const adminUser = { id: 'u-admin', email: 'admin@marble-platform.local', name: 'Admin', roles: ['ADMIN'] };
const editorUser = { id: 'u-editor', email: 'editor@marble-platform.local', name: 'Editor', roles: ['EDITOR'] };

function dbSessionUser(user: { id: string; email: string; name: string; roles: string[] }) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: true,
    roles: user.roles.map((name) => ({ role: { name } })),
  };
}

function mockSession(user: { id: string; email: string; name: string; roles: string[] } | null) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === 'mp_admin_session' && user ? { value: 'tok' } : undefined),
  } as never);
  vi.mocked(prisma.adminSession.findUnique).mockResolvedValue(
    user ? ({ id: 's-1', expiresAt: new Date(Date.now() + 60_000), user: dbSessionUser(user) } as never) : null
  );
}

function makeItem(overrides: Record<string, unknown> = {}) {
  const now = new Date('2026-01-01T00:00:00Z');
  return {
    id: '11111111-1111-4111-8111-111111111111',
    type: 'PRODUCT',
    aggregateState: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    product: {
      internalIdentifier: 'demo-ivory',
      surfaceFinish: 'Honed',
      dimensions: '300x600mm',
      format: 'Slab',
      origin: 'Afyon',
      applicableStandards: null,
    },
    variants: [
      {
        id: 'v-tr',
        locale: 'tr',
        slug: 'demo-ivory-stone',
        name: 'Demo Ivory',
        description: 'TR desc',
        tagline: null,
        seoTitle: null,
        seoDescription: null,
        seoCanonical: null,
        isFeatured: true,
        featuredOrder: 1,
        displayOrder: 5,
        lifecycleState: 'PUBLISHED',
      },
      {
        id: 'v-en',
        locale: 'en',
        slug: 'demo-ivory-stone',
        name: 'Demo Ivory',
        description: 'EN desc',
        tagline: null,
        seoTitle: null,
        seoDescription: null,
        seoCanonical: null,
        isFeatured: false,
        featuredOrder: null,
        displayOrder: null,
        lifecycleState: 'PUBLISHED',
      },
    ],
    ...overrides,
  };
}

function validCreateBody() {
  return {
    internalIdentifier: 'new-01',
    surfaceFinish: 'Polished',
    tr: { slug: 'yeni-urun', name: 'Yeni Ürün', description: 'TR açıklama' },
    en: { slug: 'new-product', name: 'New Product', description: 'EN description' },
  };
}

function req(url: string, method: string, body?: unknown): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }) as never;
}

function ctx(params: Record<string, string> = {}) {
  return { params: Promise.resolve(params) };
}

describe('admin products authZ', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each([
    ['list', () => LIST(new Request('http://localhost/api/v1/admin/products') as never, ctx())],
    ['create', () => CREATE(req('http://localhost/api/v1/admin/products', 'POST', validCreateBody()), ctx())],
    ['detail', () => DETAIL(new Request('http://localhost/api/v1/admin/products/11111111-1111-4111-8111-111111111111') as never, ctx({ id: '11111111-1111-4111-8111-111111111111' }))],
  ])('%s returns 401 unauthenticated', async (_name, call) => {
    mockSession(null);
    const res = await call();
    expect(res.status).toBe(401);
    expect((await res.json()).error.code).toBe('UNAUTHORIZED');
  });

  it('EDITOR can read, create and update but not delete', async () => {
    mockSession(editorUser);
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([makeItem()] as never);
    vi.mocked(prisma.contentItem.count).mockResolvedValue(1);

    const list = await LIST(new Request('http://localhost/api/v1/admin/products') as never, ctx());
    expect(list.status).toBe(200);

    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentItem.create).mockResolvedValue(makeItem() as never);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue({ id: 'rev-new' } as never);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeItem() as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
    const created = await CREATE(req('http://localhost/api/v1/admin/products', 'POST', validCreateBody()), ctx());
    expect(created.status).toBe(200);

    // Published rows stay immutable: edits land in draft revisions.
    const draftRow = {
      id: 'rev-draft',
      revisionNumber: 2,
      status: 'DRAFT',
      materialSnapshot: '{}',
      contentVariantId: 'v-tr',
      contentVariant: { id: 'v-tr', locale: 'tr', lifecycleState: 'PUBLISHED', contentItemId: '11111111-1111-4111-8111-111111111111', contentItem: { type: 'PRODUCT' } },
    };
    vi.mocked(prisma.contentVariant.findUnique).mockImplementation(async (args: never) => {
      const id = (args as { where: { id: string } }).where.id;
      const v = makeItem().variants.find((x) => x.id === id);
      return (v ? { ...v, contentItem: { id: makeItem().id, product: makeItem().product } } : null) as never;
    });
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue(draftRow as never);
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(draftRow as never);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({} as never);
    const updated = await UPDATE(
      req('http://localhost/api/v1/admin/products/11111111-1111-4111-8111-111111111111', 'PATCH', { tr: { name: 'Güncel' } }),
      ctx({ id: '11111111-1111-4111-8111-111111111111' })
    );
    expect(updated.status).toBe(200);
    expect(vi.mocked(prisma.contentVariant.update)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.contentRevision.create)).toHaveBeenCalled();

    const deleted = await REMOVE(
      new Request('http://localhost/api/v1/admin/products/11111111-1111-4111-8111-111111111111', { method: 'DELETE' }) as never,
      ctx({ id: '11111111-1111-4111-8111-111111111111' })
    );
    expect(deleted.status).toBe(403);
    expect((await deleted.json()).error.code).toBe('FORBIDDEN');
  });

  it('ADMIN can delete and an audit event is written', async () => {
    mockSession(adminUser);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeItem() as never);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
    vi.mocked(prisma.contentItem.delete).mockResolvedValue({} as never);

    const res = await REMOVE(
      new Request('http://localhost/api/v1/admin/products/11111111-1111-4111-8111-111111111111', { method: 'DELETE' }) as never,
      ctx({ id: '11111111-1111-4111-8111-111111111111' })
    );
    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.contentItem.delete)).toHaveBeenCalledWith({ where: { id: '11111111-1111-4111-8111-111111111111' } });
    const auditCall = vi.mocked(prisma.auditEvent.create).mock.calls[0][0];
    expect(auditCall.data.action).toBe('PRODUCT_DELETE');
    expect(auditCall.data.actorId).toBe('u-admin');
    expect(JSON.stringify(auditCall)).not.toMatch(/password|token/i);
  });
});

describe('admin products validation and persistence', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSession(adminUser);
  });

  it('rejects missing TR/EN variants with 422', async () => {
    const res = await CREATE(req('http://localhost/api/v1/admin/products', 'POST', { tr: { slug: 'x', name: 'X' } }), ctx());
    expect(res.status).toBe(422);
    expect(vi.mocked(prisma.contentItem.create)).not.toHaveBeenCalled();
  });

  it('rejects invalid slug format with 422', async () => {
    const body = validCreateBody();
    body.tr.slug = 'Invalid Slug!';
    const res = await CREATE(req('http://localhost/api/v1/admin/products', 'POST', body), ctx());
    expect(res.status).toBe(422);
  });

  it('rejects duplicate slug with 409', async () => {
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue({ id: 'clash' } as never);
    const res = await CREATE(req('http://localhost/api/v1/admin/products', 'POST', validCreateBody()), ctx());
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('CONFLICT');
    expect(vi.mocked(prisma.contentItem.create)).not.toHaveBeenCalled();
  });

  it('creates TR+EN variants as DRAFT with draft revisions', async () => {
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentItem.create).mockResolvedValue(makeItem() as never);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue({ id: 'rev-new' } as never);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeItem() as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);

    const body = validCreateBody();
    body.tr.isFeatured = true;
    (body.tr as Record<string, unknown>).displayOrder = 7;
    const res = await CREATE(req('http://localhost/api/v1/admin/products', 'POST', body), ctx());
    expect(res.status).toBe(200);

    const createArg = vi.mocked(prisma.contentItem.create).mock.calls[0][0];
    expect(createArg.data.type).toBe('PRODUCT');
    expect(createArg.data.aggregateState).toBe('DRAFT');
    const locales = createArg.data.variants.create.map((v: { locale: string }) => v.locale).sort();
    expect(locales).toEqual(['en', 'tr']);
    const trVariant = createArg.data.variants.create.find((v: { locale: string }) => v.locale === 'tr');
    expect(trVariant.lifecycleState).toBe('DRAFT');
    // Initial draft revisions carry the input snapshot.
    expect(vi.mocked(prisma.contentRevision.create).mock.calls).toHaveLength(2);

    const auditActions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(auditActions).toContain('PRODUCT_CREATE');
    expect(auditActions).toContain('CONTENT_REVISION_CREATE');
  });

  it('routes published edits to draft snapshots, rows stay immutable', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeItem() as never);
    const draftRow = (locale: string, variantId: string) => ({
      id: `rev-${locale}`,
      revisionNumber: 2,
      status: 'DRAFT',
      materialSnapshot: '{}',
      contentVariantId: variantId,
      contentVariant: { id: variantId, locale, lifecycleState: 'PUBLISHED', contentItemId: '11111111-1111-4111-8111-111111111111', contentItem: { type: 'PRODUCT' } },
    });
    vi.mocked(prisma.contentVariant.findUnique).mockImplementation(async (args: never) => {
      const id = (args as { where: { id: string } }).where.id;
      const v = makeItem().variants.find((x) => x.id === id);
      return (v ? { ...v, contentItem: { id: makeItem().id, product: makeItem().product } } : null) as never;
    });
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentRevision.create).mockImplementation(async (args: never) => {
      const data = (args as { data: Record<string, unknown> }).data;
      return { id: 'rev-new', ...data } as never;
    });
    vi.mocked(prisma.contentRevision.findUnique).mockImplementation(async (args: never) => {
      const id = (args as { where: { id: string } }).where.id;
      return { ...draftRow('tr', 'v-tr'), id } as never;
    });
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({} as never);
    vi.mocked(prisma.product.update).mockResolvedValue({} as never);
    vi.mocked(prisma.contentVariant.update).mockResolvedValue({} as never);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);

    const res = await UPDATE(
      req('http://localhost/api/v1/admin/products/11111111-1111-4111-8111-111111111111', 'PATCH', {
        surfaceFinish: 'Brushed',
        tr: { name: 'Güncel İsim', isFeatured: false, displayOrder: 9 },
        en: { seoTitle: 'SEO EN' },
      }),
      ctx({ id: '11111111-1111-4111-8111-111111111111' })
    );
    expect(res.status).toBe(200);
    // Published variant rows are never mutated…
    expect(vi.mocked(prisma.contentVariant.update)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.product.update)).not.toHaveBeenCalled();
    // …edits merge into per-locale draft snapshots instead.
    expect(vi.mocked(prisma.contentRevision.update).mock.calls.length).toBeGreaterThanOrEqual(2);
    const json = await res.json();
    expect(json.data.tr.name).toBeDefined();
    expect(vi.mocked(prisma.auditEvent.create)).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'PRODUCT_UPDATE', actorId: 'u-admin' }) })
    );
  });

  it('returns 404 for unknown product id', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(null);
    const res = await DETAIL(new Request('http://localhost/api/v1/admin/products/nope') as never, ctx({ id: '00000000-0000-4000-8000-000000000000' }));
    expect(res.status).toBe(404);
  });

  it('rejects malformed id with 400', async () => {
    const res = await DETAIL(new Request('http://localhost/api/v1/admin/products/nope') as never, ctx({ id: 'nope' }));
    expect(res.status).toBe(400);
  });

  it('public product endpoints have no mutations', async () => {
    const fs = await import('node:fs');
    const routeFiles = [
      'src/app/api/v1/public/[locale]/products/route.ts',
      'src/app/api/v1/public/[locale]/products/[slug]/route.ts',
    ];
    for (const file of routeFiles) {
      const src = fs.readFileSync(file, 'utf8');
      expect(src).not.toMatch(/export const (POST|PUT|PATCH|DELETE)/);
    }
  });
});
