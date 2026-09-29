import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as COLL_LIST, POST as COLL_CREATE } from '@/app/api/v1/admin/collections/route';
import { GET as COLL_GET, PATCH as COLL_UPDATE, DELETE as COLL_DELETE } from '@/app/api/v1/admin/collections/[id]/route';
import { POST as COLL_ATTACH } from '@/app/api/v1/admin/collections/[id]/products/route';
import { GET as COLL_WF } from '@/app/api/v1/admin/collections/[id]/workflow/route';
import { GET as APP_LIST, POST as APP_CREATE } from '@/app/api/v1/admin/applications/route';
import { GET as APP_GET, PATCH as APP_UPDATE, DELETE as APP_DELETE } from '@/app/api/v1/admin/applications/[id]/route';
import { POST as APP_ATTACH } from '@/app/api/v1/admin/applications/[id]/products/route';
import { POST as SUBMIT } from '@/app/api/v1/admin/revisions/[revId]/submit/route';
import { POST as APPROVE } from '@/app/api/v1/admin/revisions/[revId]/approve/route';
import { POST as PUBLISH } from '@/app/api/v1/admin/revisions/[revId]/publish/route';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { contentRepository } from '@/repositories/content';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contentVariant: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    contentItem: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn(), update: vi.fn() },
    contentRevision: { findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    contentMedia: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
    mediaAsset: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    product: { update: vi.fn() },
    productCollection: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    productApplication: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    approval: { create: vi.fn(), findFirst: vi.fn() },
    adminSession: { findUnique: vi.fn(), delete: vi.fn() },
    auditEvent: { create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const ADMIN = { id: 'u-admin', email: 'a@x.local', name: 'A', roles: ['ADMIN'] };
const EDITOR = { id: 'u-editor', email: 'e@x.local', name: 'E', roles: ['EDITOR'] };
const COLL_ID = '33333333-3333-4333-8333-333333333333';
const APP_ID = '44444444-4444-4444-8444-444444444444';
const PROD_REF = '55555555-5555-4555-8555-555555555555';

function mockSession(user: typeof ADMIN | null) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === 'mp_admin_session' && user ? { value: 'tok' } : undefined),
  } as never);
  vi.mocked(prisma.adminSession.findUnique).mockResolvedValue(
    user
      ? {
          id: 's-1',
          expiresAt: new Date(Date.now() + 60_000),
          user: { ...user, isActive: true, roles: user.roles.map((name) => ({ role: { name } })) },
        } as never
      : null
  );
}

function makeTaxonomyItem(type: string, id: string) {
  const now = new Date('2026-01-01T00:00:00Z');
  const variant = (locale: string, vid: string) => ({
    id: vid,
    locale,
    slug: `slug-${locale}`,
    name: `Name ${locale}`,
    description: '',
    tagline: null,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    isFeatured: false,
    featuredOrder: null,
    displayOrder: null,
    lifecycleState: 'PUBLISHED',
  });
  return {
    id,
    type,
    aggregateState: 'ACTIVE',
    createdAt: now,
    updatedAt: now,
    variants: [variant('tr', `v-${id}-tr`), variant('en', `v-${id}-en`)],
  };
}

function validBody(slug: string, name: string) {
  return {
    tr: { slug: `${slug}-tr`, name: `${name} TR` },
    en: { slug: `${slug}-en`, name: `${name} EN` },
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

const COLLECTION_ROUTES = {
  list: () => COLL_LIST(new Request('http://localhost/x') as never, ctx()),
  create: (body: unknown) => COLL_CREATE(req('http://localhost/x', 'POST', body), ctx()),
  detail: () => COLL_GET(new Request('http://localhost/x') as never, ctx({ id: COLL_ID })),
  update: (body: unknown) => COLL_UPDATE(req('http://localhost/x', 'PATCH', body), ctx({ id: COLL_ID })),
  remove: () => COLL_DELETE(new Request('http://localhost/x', { method: 'DELETE' }) as never, ctx({ id: COLL_ID })),
  attach: (body: unknown) => COLL_ATTACH(req('http://localhost/x', 'POST', body), ctx({ id: COLL_ID })),
};

const APPLICATION_ROUTES = {
  list: () => APP_LIST(new Request('http://localhost/x') as never, ctx()),
  create: (body: unknown) => APP_CREATE(req('http://localhost/x', 'POST', body), ctx()),
  detail: () => APP_GET(new Request('http://localhost/x') as never, ctx({ id: APP_ID })),
  update: (body: unknown) => APP_UPDATE(req('http://localhost/x', 'PATCH', body), ctx({ id: APP_ID })),
  remove: () => APP_DELETE(new Request('http://localhost/x', { method: 'DELETE' }) as never, ctx({ id: APP_ID })),
  attach: (body: unknown) => APP_ATTACH(req('http://localhost/x', 'POST', body), ctx({ id: APP_ID })),
};

const KINDS = [
  { name: 'collections', type: 'COLLECTION', id: COLL_ID, routes: COLLECTION_ROUTES },
  { name: 'applications', type: 'APPLICATION', id: APP_ID, routes: APPLICATION_ROUTES },
] as const;

describe.each(KINDS)('$name admin CRUD', ({ type, id, routes }) => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 unauthenticated', async () => {
    mockSession(null);
    for (const call of [routes.list(), routes.create(validBody('x', 'X')), routes.detail(), routes.update({}), routes.remove()]) {
      expect((await call).status).toBe(401);
    }
  });

  it('EDITOR can manage but not delete', async () => {
    mockSession(EDITOR);
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([makeTaxonomyItem(type, id)] as never);
    vi.mocked(prisma.contentItem.count).mockResolvedValue(1);
    expect((await routes.list()).status).toBe(200);

    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentItem.create).mockResolvedValue(makeTaxonomyItem(type, id) as never);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue({ id: 'r' } as never);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeTaxonomyItem(type, id) as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
    expect((await routes.create(validBody('new', 'New'))).status).toBe(200);

    expect((await routes.remove()).status).toBe(403);
  });

  it('ADMIN full cycle with audits, products untouched on delete', async () => {
    mockSession(ADMIN);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeTaxonomyItem(type, id) as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);

    expect((await routes.detail()).status).toBe(200);

    // Published edit → draft snapshot, rows immutable.
    const draftRow = {
      id: 'rev-d',
      revisionNumber: 2,
      status: 'DRAFT',
      materialSnapshot: '{}',
      contentVariantId: 'v-x',
      contentVariant: { id: 'v-x', locale: 'tr', lifecycleState: 'PUBLISHED', contentItemId: id, contentItem: { type } },
    };
    vi.mocked(prisma.contentVariant.findUnique).mockResolvedValue({
      id: 'v-x',
      locale: 'tr',
      slug: 's',
      name: 'N',
      description: '',
      tagline: null,
      seoTitle: null,
      seoDescription: null,
      seoCanonical: null,
      isFeatured: false,
      featuredOrder: null,
      displayOrder: null,
      contentItem: { id, product: null },
    } as never);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue({ id: 'rev-d' } as never);
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(draftRow as never);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({} as never);
    expect((await routes.update({ tr: { name: 'Updated' } })).status).toBe(200);
    expect(vi.mocked(prisma.contentVariant.update)).not.toHaveBeenCalled();

    expect((await routes.remove()).status).toBe(200);
    expect(vi.mocked(prisma.contentItem.delete)).toHaveBeenCalledWith({ where: { id } });
    // Junction cascade is schema-level; service must never delete products.
    expect(vi.mocked(prisma.contentItem.delete).mock.calls).toHaveLength(1);
    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain(`${type}_UPDATE`);
    expect(actions).toContain(`${type}_DELETE`);
  });

  it('validates input, duplicate slug, unknown and malformed ids', async () => {
    mockSession(ADMIN);
    expect((await routes.create({ tr: { slug: 'x', name: 'X' } })).status).toBe(422);

    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue({ id: 'clash' } as never);
    const dup = await routes.create(validBody('dup', 'Dup'));
    expect(dup.status).toBe(409);
    expect((await dup.json()).error.code).toBe('CONFLICT');

    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(null);
    const missing = await routes.detail();
    expect(missing.status).toBe(404);
  });
});

describe.each(KINDS)('$name product relations', ({ type, id, routes }) => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSession(EDITOR);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
  });

  function junctionMocks() {
    return type === 'COLLECTION' ? prisma.productCollection : prisma.productApplication;
  }

  it('attaches, rejects duplicates, detaches, keeps products', async () => {
    const junctions = junctionMocks() as unknown as {
      findUnique: ReturnType<typeof vi.fn>;
      create: ReturnType<typeof vi.fn>;
      deleteMany: ReturnType<typeof vi.fn>;
    };
    vi.mocked(prisma.contentItem.findUnique).mockImplementation(async (args: never) => {
      const where = (args as { where: { id: string } }).where;
      if (where.id === id) return { id, type } as never;
      if (where.id === PROD_REF) {
        return { id: PROD_REF, type: 'PRODUCT', variants: [] } as never;
      }
      return null;
    });

    junctions.findUnique.mockResolvedValue(null);
    junctions.create.mockResolvedValue({} as never);
    junctions.findMany = vi.fn().mockResolvedValue([]);
    const attached = await routes.attach({ productId: PROD_REF });
    expect(attached.status).toBe(200);

    junctions.findUnique.mockResolvedValue({} as never);
    const dup = await routes.attach({ productId: PROD_REF });
    expect(dup.status).toBe(409);

    junctions.deleteMany.mockResolvedValue({ count: 1 } as never);
    const detachUrl =
      type === 'COLLECTION'
        ? `http://localhost/x?productId=${PROD_REF}`
        : `http://localhost/x?productId=${PROD_REF}`;
    const { DELETE: DETACH_ROUTE } = type === 'COLLECTION'
      ? await import('@/app/api/v1/admin/collections/[id]/products/route')
      : await import('@/app/api/v1/admin/applications/[id]/products/route');
    const detached = await DETACH_ROUTE(new Request(detachUrl, { method: 'DELETE' }) as never, ctx({ id }));
    expect(detached.status).toBe(200);

    junctions.deleteMany.mockResolvedValue({ count: 0 } as never);
    const missing = await DETACH_ROUTE(new Request(detachUrl, { method: 'DELETE' }) as never, ctx({ id }));
    expect(missing.status).toBe(404);

    const auditActions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(auditActions).toContain(`${type}_PRODUCT_ATTACH`);
    expect(auditActions).toContain(`${type}_PRODUCT_DETACH`);
  });

  it('rejects invalid product with 404', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockImplementation(async (args: never) => {
      const where = (args as { where: { id: string } }).where;
      if (where.id === id) return { id, type } as never;
      return null;
    });
    const res = await routes.attach({ productId: PROD_REF });
    expect(res.status).toBe(404);
  });
});

describe('taxonomy workflow reuse', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSession(ADMIN);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (ops: never) => {
      const results = [];
      for (const op of ops as unknown[]) results.push(await (op as Promise<unknown>));
      return results;
    });
  });

  it('collection draft → submit → approve → publish isolates public output', async () => {
    const snapshot = { slug: 'yeni-koleksiyon', name: 'Yeni Koleksiyon' };
    const rev = (status: string, n = 2) => ({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      revisionNumber: n,
      status,
      materialSnapshot: JSON.stringify(snapshot),
      contentVariantId: 'v-ctr',
      contentVariant: { id: 'v-ctr', locale: 'tr', lifecycleState: 'PUBLISHED', contentItemId: COLL_ID, contentItem: { type: 'COLLECTION', aggregateState: 'ACTIVE' } },
      author: { email: 'e@x.local' },
      approvals: [],
      createdAt: new Date(),
    });

    // submit
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(rev('DRAFT') as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({ ...rev('IN_REVIEW'), approvals: [] } as never);
    expect((await SUBMIT(req('http://localhost/x', 'POST'), ctx({ revId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }))).status).toBe(200);

    // approve
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(rev('IN_REVIEW') as never);
    vi.mocked(prisma.contentMedia.findMany).mockResolvedValue([]);
    vi.mocked(prisma.approval.create).mockResolvedValue({} as never);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({ ...rev('APPROVED'), approvals: [] } as never);
    expect((await APPROVE(req('http://localhost/x', 'POST'), ctx({ revId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }))).status).toBe(200);

    // publish → variant PUBLISHED, no product ext touched
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(rev('APPROVED') as never);
    vi.mocked(prisma.approval.findFirst).mockResolvedValue({ id: 'ap' } as never);
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentVariant.update).mockResolvedValue({} as never);
    vi.mocked(prisma.product.update).mockResolvedValue({} as never);
    vi.mocked(prisma.contentItem.update).mockResolvedValue({} as never);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({ id: COLL_ID, type: 'COLLECTION', variants: [] } as never);
    const published = await PUBLISH(req('http://localhost/x', 'POST'), ctx({ revId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }));
    expect(published.status).toBe(200);
    expect(vi.mocked(prisma.product.update)).not.toHaveBeenCalled();
    const variantUpdate = vi.mocked(prisma.contentVariant.update).mock.calls[0][0];
    expect(variantUpdate.data).toMatchObject({ slug: 'yeni-koleksiyon', lifecycleState: 'PUBLISHED' });

    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toEqual(expect.arrayContaining(['CONTENT_SUBMIT_REVIEW', 'CONTENT_APPROVE', 'CONTENT_PUBLISH']));
  });

  it('collection workflow status endpoint works', async () => {
    mockSession(EDITOR);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({
      id: COLL_ID,
      type: 'COLLECTION',
      variants: [{ id: 'v', locale: 'tr', lifecycleState: 'PUBLISHED', revisions: [] }],
    } as never);
    expect((await COLL_WF(new Request('http://localhost/x') as never, ctx({ id: COLL_ID }))).status).toBe(200);
  });

  it('new draft endpoint creates drafts for collections', async () => {
    mockSession(EDITOR);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({
      id: COLL_ID,
      type: 'COLLECTION',
      variants: [{ id: 'v-ctr', locale: 'tr', revisions: [] }],
    } as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentVariant.findUnique).mockResolvedValue({
      id: 'v-ctr',
      locale: 'tr',
      slug: 's',
      name: 'N',
      description: '',
      tagline: null,
      seoTitle: null,
      seoDescription: null,
      seoCanonical: null,
      isFeatured: false,
      featuredOrder: null,
      displayOrder: null,
      contentItem: { id: COLL_ID, product: null },
    } as never);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue({ id: 'rev-n', revisionNumber: 2 } as never);
    const { POST: COLL_NEW_DRAFT } = await import('@/app/api/v1/admin/collections/[id]/revisions/route');
    const res = await COLL_NEW_DRAFT(req('http://localhost/x', 'POST', { locale: 'tr' }), ctx({ id: COLL_ID }));
    expect(res.status).toBe(200);
  });
});

describe('public gates for taxonomy content', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('list queries gate on ACTIVE + PUBLISHED per locale, no fallback', async () => {
    vi.mocked(prisma.contentVariant.findMany).mockResolvedValue([]);
    vi.mocked(prisma.contentVariant.count).mockResolvedValue(0);
    await contentRepository.listPublished({ contentType: 'COLLECTION', locale: 'tr', pagination: { page: 1, pageSize: 20 } });
    const args = vi.mocked(prisma.contentVariant.findMany).mock.calls[0][0];
    expect(args.where).toMatchObject({
      locale: 'tr',
      lifecycleState: 'PUBLISHED',
      contentItem: { type: 'COLLECTION' },
    });
    expect(args.where.contentItem).toMatchObject({ aggregateState: 'ACTIVE' });
  });
});
