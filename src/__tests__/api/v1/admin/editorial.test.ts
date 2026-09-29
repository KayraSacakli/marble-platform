import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as PROJ_LIST, POST as PROJ_CREATE } from '@/app/api/v1/admin/projects/route';
import { GET as PROJ_GET, PATCH as PROJ_UPDATE, DELETE as PROJ_DELETE } from '@/app/api/v1/admin/projects/[id]/route';
import { POST as PROJ_ATTACH_P, DELETE as PROJ_DETACH_P } from '@/app/api/v1/admin/projects/[id]/products/route';
import { GET as JOUR_LIST, POST as JOUR_CREATE } from '@/app/api/v1/admin/journal/route';
import { GET as JOUR_GET, PATCH as JOUR_UPDATE, DELETE as JOUR_DELETE } from '@/app/api/v1/admin/journal/[id]/route';
import { POST as SUBMIT } from '@/app/api/v1/admin/revisions/[revId]/submit/route';
import { POST as APPROVE } from '@/app/api/v1/admin/revisions/[revId]/approve/route';
import { POST as PUBLISH } from '@/app/api/v1/admin/revisions/[revId]/publish/route';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contentItem: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn(), update: vi.fn() },
    contentVariant: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    contentRevision: { findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    contentMedia: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
    mediaAsset: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    product: { update: vi.fn() },
    project: { update: vi.fn() },
    journalArticle: { update: vi.fn() },
    projectProduct: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    projectApplication: { findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
    journalContentReference: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn() },
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
const PROJ_ID = '66666666-6666-4666-8666-666666666666';
const JOUR_ID = '77777777-7777-4777-8777-777777777777';
const TARGET_ID = '88888888-8888-4888-8888-888888888888';

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

function makeEditorialItem(type: string, id: string) {
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
    project: type === 'PROJECT' ? { location: 'Istanbul', projectType: 'Hotel' } : null,
    journalArticle: type === 'JOURNAL_ARTICLE' ? { publicationDate: now, authorName: 'Author' } : null,
    variants: [variant('tr', `v-${id}-tr`), variant('en', `v-${id}-en`)],
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

function projectBody() {
  return {
    location: 'Istanbul',
    projectType: 'Hotel Lobby',
    tr: { slug: 'proje-tr', name: 'Proje' },
    en: { slug: 'project-en', name: 'Project' },
  };
}

function journalBody() {
  return {
    publicationDate: '2026-02-01',
    authorName: 'Writer',
    tr: { slug: 'yazi-tr', name: 'Yazı' },
    en: { slug: 'article-en', name: 'Article' },
  };
}

describe('editorial authZ', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns 401 unauthenticated across project/journal endpoints', async () => {
    mockSession(null);
    const calls = [
      PROJ_LIST(new Request('http://localhost/x') as never, ctx()),
      PROJ_CREATE(req('http://localhost/x', 'POST', projectBody()), ctx()),
      PROJ_GET(new Request('http://localhost/x') as never, ctx({ id: PROJ_ID })),
      PROJ_UPDATE(req('http://localhost/x', 'PATCH', {}), ctx({ id: PROJ_ID })),
      PROJ_DELETE(new Request('http://localhost/x', { method: 'DELETE' }) as never, ctx({ id: PROJ_ID })),
      JOUR_LIST(new Request('http://localhost/x') as never, ctx()),
      JOUR_CREATE(req('http://localhost/x', 'POST', journalBody()), ctx()),
      JOUR_GET(new Request('http://localhost/x') as never, ctx({ id: JOUR_ID })),
      JOUR_UPDATE(req('http://localhost/x', 'PATCH', {}), ctx({ id: JOUR_ID })),
      JOUR_DELETE(new Request('http://localhost/x', { method: 'DELETE' }) as never, ctx({ id: JOUR_ID })),
    ];
    for (const call of calls) {
      expect((await call).status).toBe(401);
    }
  });

  it('EDITOR manages content but cannot delete or publish', async () => {
    mockSession(EDITOR);
    vi.mocked(prisma.contentItem.findMany).mockResolvedValue([makeEditorialItem('PROJECT', PROJ_ID)] as never);
    vi.mocked(prisma.contentItem.count).mockResolvedValue(1);
    expect((await PROJ_LIST(new Request('http://localhost/x') as never, ctx())).status).toBe(200);

    expect((await PROJ_DELETE(new Request('http://localhost/x', { method: 'DELETE' }) as never, ctx({ id: PROJ_ID }))).status).toBe(403);
    expect((await JOUR_DELETE(new Request('http://localhost/x', { method: 'DELETE' }) as never, ctx({ id: JOUR_ID }))).status).toBe(403);

    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue({
      id: '99999999-9999-4999-8999-999999999999',
      status: 'IN_REVIEW',
    } as never);
    expect((await PUBLISH(req('http://localhost/x', 'POST'), ctx({ revId: '99999999-9999-4999-8999-999999999999' }))).status).toBe(403);
  });
});

describe('project CRUD', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSession(ADMIN);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
  });

  it('creates DRAFT projects with revisions and audits', async () => {
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentItem.create).mockResolvedValue(makeEditorialItem('PROJECT', PROJ_ID) as never);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue({ id: 'r' } as never);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeEditorialItem('PROJECT', PROJ_ID) as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);

    const res = await PROJ_CREATE(req('http://localhost/x', 'POST', projectBody()), ctx());
    expect(res.status).toBe(200);
    const createArg = vi.mocked(prisma.contentItem.create).mock.calls[0][0];
    expect(createArg.data.type).toBe('PROJECT');
    expect(createArg.data.aggregateState).toBe('DRAFT');
    expect(createArg.data.project.create).toMatchObject({ location: 'Istanbul' });
    expect(vi.mocked(prisma.contentRevision.create).mock.calls).toHaveLength(2);
    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain('PROJECT_CREATE');
  });

  it('rejects invalid input and duplicate slugs', async () => {
    expect((await PROJ_CREATE(req('http://localhost/x', 'POST', { tr: { slug: 'x', name: 'X' } }), ctx())).status).toBe(422);
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue({ id: 'clash' } as never);
    const dup = await PROJ_CREATE(req('http://localhost/x', 'POST', projectBody()), ctx());
    expect(dup.status).toBe(409);
  });

  it('edits into drafts, rows immutable, ext merged', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeEditorialItem('PROJECT', PROJ_ID) as never);
    const draftRow = {
      id: 'rev-d',
      revisionNumber: 2,
      status: 'DRAFT',
      materialSnapshot: '{}',
      contentVariantId: 'v-x',
      contentVariant: { id: 'v-x', locale: 'tr', lifecycleState: 'PUBLISHED', contentItemId: PROJ_ID, contentItem: { type: 'PROJECT' } },
    };
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
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
      contentItem: { id: PROJ_ID, product: null, project: { location: 'Istanbul', projectType: 'Hotel' }, journalArticle: null },
    } as never);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue({ id: 'rev-d' } as never);
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(draftRow as never);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({} as never);

    const res = await PROJ_UPDATE(
      req('http://localhost/x', 'PATCH', { location: 'Ankara', tr: { name: 'Güncel' } }),
      ctx({ id: PROJ_ID })
    );
    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.contentVariant.update)).not.toHaveBeenCalled();
    expect(vi.mocked(prisma.project.update)).not.toHaveBeenCalled();
    const snapUpdate = vi.mocked(prisma.contentRevision.update).mock.calls[0][0];
    const snapshot = JSON.parse(snapUpdate.data.materialSnapshot as string);
    expect(snapshot.name).toBe('Güncel');
    expect(snapshot.project.location).toBe('Ankara');
  });

  it('deletes without touching related content', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeEditorialItem('PROJECT', PROJ_ID) as never);
    vi.mocked(prisma.contentItem.delete).mockResolvedValue({} as never);
    const res = await PROJ_DELETE(new Request('http://localhost/x', { method: 'DELETE' }) as never, ctx({ id: PROJ_ID }));
    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.contentItem.delete).mock.calls).toHaveLength(1);
    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain('PROJECT_DELETE');
  });
});

describe('journal CRUD', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSession(ADMIN);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
  });

  it('requires a valid publication date', async () => {
    const missing = await JOUR_CREATE(req('http://localhost/x', 'POST', { tr: { slug: 'x', name: 'X' }, en: { slug: 'y', name: 'Y' } }), ctx());
    expect(missing.status).toBe(422);
    const badDate = await JOUR_CREATE(
      req('http://localhost/x', 'POST', { ...journalBody(), publicationDate: 'not-a-date' }),
      ctx()
    );
    expect(badDate.status).toBe(422);
    expect(vi.mocked(prisma.contentItem.create)).not.toHaveBeenCalled();
  });

  it('creates DRAFT articles with revisions and audits', async () => {
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentItem.create).mockResolvedValue(makeEditorialItem('JOURNAL_ARTICLE', JOUR_ID) as never);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue({ id: 'r' } as never);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeEditorialItem('JOURNAL_ARTICLE', JOUR_ID) as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);

    const res = await JOUR_CREATE(req('http://localhost/x', 'POST', journalBody()), ctx());
    expect(res.status).toBe(200);
    const createArg = vi.mocked(prisma.contentItem.create).mock.calls[0][0];
    expect(createArg.data.type).toBe('JOURNAL_ARTICLE');
    expect(createArg.data.journalArticle.create.publicationDate).toBeInstanceOf(Date);
    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain('JOURNAL_CREATE');
  });

  it('ADMIN deletes articles, products survive', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeEditorialItem('JOURNAL_ARTICLE', JOUR_ID) as never);
    vi.mocked(prisma.contentItem.delete).mockResolvedValue({} as never);
    const res = await JOUR_DELETE(new Request('http://localhost/x', { method: 'DELETE' }) as never, ctx({ id: JOUR_ID }));
    expect(res.status).toBe(200);
    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain('JOURNAL_DELETE');
  });
});

describe('project relations and journal references', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSession(EDITOR);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
  });

  function mockEntities() {
    vi.mocked(prisma.contentItem.findUnique).mockImplementation(async (args: never) => {
      const id = (args as { where: { id: string } }).where.id;
      if (id === PROJ_ID) return { id, type: 'PROJECT', variants: [] } as never;
      if (id === TARGET_ID) return { id, type: 'PRODUCT', variants: [] } as never;
      return null;
    });
  }

  it('project product attach/dup/detach with audits', async () => {
    mockEntities();
    vi.mocked(prisma.projectProduct.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.projectProduct.create).mockResolvedValue({} as never);
    vi.mocked(prisma.projectProduct.findMany).mockResolvedValue([] as never);
    expect((await PROJ_ATTACH_P(req('http://localhost/x', 'POST', { productId: TARGET_ID }), ctx({ id: PROJ_ID }))).status).toBe(200);

    vi.mocked(prisma.projectProduct.findUnique).mockResolvedValue({} as never);
    expect((await PROJ_ATTACH_P(req('http://localhost/x', 'POST', { productId: TARGET_ID }), ctx({ id: PROJ_ID }))).status).toBe(409);

    vi.mocked(prisma.projectProduct.deleteMany).mockResolvedValue({ count: 1 } as never);
    expect((await PROJ_DETACH_P(new Request(`http://localhost/x?productId=${TARGET_ID}`, { method: 'DELETE' }) as never, ctx({ id: PROJ_ID }))).status).toBe(200);

    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain('PROJECT_PRODUCT_ATTACH');
    expect(actions).toContain('PROJECT_PRODUCT_DETACH');
  });

  it('rejects invalid product references with 404', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockImplementation(async (args: never) => {
      const id = (args as { where: { id: string } }).where.id;
      return id === PROJ_ID ? ({ id, type: 'PROJECT', variants: [] } as never) : null;
    });
    expect((await PROJ_ATTACH_P(req('http://localhost/x', 'POST', { productId: TARGET_ID }), ctx({ id: PROJ_ID }))).status).toBe(404);
  });

  it('journal references attach/dup/detach across target kinds', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockImplementation(async (args: never) => {
      const id = (args as { where: { id: string } }).where.id;
      if (id === JOUR_ID) return { id, type: 'JOURNAL_ARTICLE', variants: [] } as never;
      if (id === TARGET_ID) return { id, type: 'APPLICATION', variants: [] } as never;
      return null;
    });
    vi.mocked(prisma.journalContentReference.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.journalContentReference.create).mockResolvedValue({} as never);
    vi.mocked(prisma.journalContentReference.findMany).mockResolvedValue([] as never);

    const { POST: JREF_ATTACH } = await import('@/app/api/v1/admin/journal/[id]/references/route');
    const { DELETE: JREF_DETACH, GET: JREF_LIST } = await import('@/app/api/v1/admin/journal/[id]/references/route');
    expect(
      (await JREF_ATTACH(req('http://localhost/x', 'POST', { targetKind: 'application', targetId: TARGET_ID }), ctx({ id: JOUR_ID }))).status
    ).toBe(200);
    expect((await JREF_LIST(new Request('http://localhost/x') as never, ctx({ id: JOUR_ID }))).status).toBe(200);

    vi.mocked(prisma.journalContentReference.findFirst).mockResolvedValue({ id: 'ref' } as never);
    expect(
      (await JREF_ATTACH(req('http://localhost/x', 'POST', { targetKind: 'application', targetId: TARGET_ID }), ctx({ id: JOUR_ID }))).status
    ).toBe(409);

    vi.mocked(prisma.journalContentReference.deleteMany).mockResolvedValue({ count: 1 } as never);
    expect(
      (await JREF_DETACH(new Request('http://localhost/x?referenceId=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', { method: 'DELETE' }) as never, ctx({ id: JOUR_ID }))).status
    ).toBe(200);

    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain('JOURNAL_REFERENCE_ATTACH');
    expect(actions).toContain('JOURNAL_REFERENCE_DETACH');
  });

  it('rejects invalid reference target kind', async () => {
    const { POST: JREF_ATTACH } = await import('@/app/api/v1/admin/journal/[id]/references/route');
    expect(
      (await JREF_ATTACH(req('http://localhost/x', 'POST', { targetKind: 'nope', targetId: TARGET_ID }), ctx({ id: JOUR_ID }))).status
    ).toBe(422);
  });
});

describe('editorial workflow and locale isolation', () => {
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

  it('journal submit → approve → publish applies ext fields', async () => {
    const snapshot = { slug: 'yazi', name: 'Yazı', journal: { publicationDate: '2026-03-01', authorName: 'Writer' } };
    const rev = (status: string) => ({
      id: 'rev-j',
      revisionNumber: 2,
      status,
      materialSnapshot: JSON.stringify(snapshot),
      contentVariantId: 'v-jtr',
      contentVariant: { id: 'v-jtr', locale: 'tr', lifecycleState: 'PUBLISHED', contentItemId: JOUR_ID, contentItem: { type: 'JOURNAL_ARTICLE', aggregateState: 'ACTIVE' } },
      author: { email: 'e@x.local' },
      approvals: [],
      createdAt: new Date(),
    });

    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(rev('DRAFT') as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({ ...rev('IN_REVIEW'), approvals: [] } as never);
    expect((await SUBMIT(req('http://localhost/x', 'POST'), ctx({ revId: '99999999-9999-4999-8999-999999999999' }))).status).toBe(200);

    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(rev('IN_REVIEW') as never);
    vi.mocked(prisma.contentMedia.findMany).mockResolvedValue([]);
    vi.mocked(prisma.approval.create).mockResolvedValue({} as never);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({ ...rev('APPROVED'), approvals: [] } as never);
    expect((await APPROVE(req('http://localhost/x', 'POST'), ctx({ revId: '99999999-9999-4999-8999-999999999999' }))).status).toBe(200);

    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(rev('APPROVED') as never);
    vi.mocked(prisma.approval.findFirst).mockResolvedValue({ id: 'ap' } as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (ops: never) => {
      const results = [];
      for (const op of ops as unknown[]) results.push(await (op as Promise<unknown>));
      return results;
    });
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentVariant.update).mockResolvedValue({} as never);
    vi.mocked(prisma.journalArticle.update).mockResolvedValue({} as never);
    vi.mocked(prisma.contentItem.update).mockResolvedValue({} as never);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({ id: JOUR_ID, type: 'JOURNAL_ARTICLE', variants: [] } as never);
    const pubRes = await PUBLISH(req('http://localhost/x', 'POST'), ctx({ revId: '99999999-9999-4999-8999-999999999999' }));
    expect(pubRes.status).toBe(200);
    expect(vi.mocked(prisma.journalArticle.update).mock.calls[0][0].data).toMatchObject({ authorName: 'Writer' });
    expect(vi.mocked(prisma.product.update)).not.toHaveBeenCalled();
  });

  it('project media attach uses generalized endpoints with role checks', async () => {
    const { GET: PM_GET, POST: PM_ATTACH } = await import('@/app/api/v1/admin/projects/[id]/media/route');
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({
      id: PROJ_ID,
      type: 'PROJECT',
      variants: [{ id: 'v', locale: 'tr' }],
    } as never);
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue({ id: 'm', mediaType: 'IMAGE' } as never);
    vi.mocked(prisma.contentMedia.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentMedia.count).mockResolvedValue(0);
    vi.mocked(prisma.contentMedia.create).mockResolvedValue({} as never);
    vi.mocked(prisma.contentMedia.findMany).mockResolvedValue([] as never);
    expect((await PM_GET(new Request('http://localhost/x') as never, ctx({ id: PROJ_ID }))).status).toBe(200);
    expect(
      (await PM_ATTACH(req('http://localhost/x', 'POST', { assetId: '00000000-0000-4000-8000-000000000001', role: 'HERO' }), ctx({ id: PROJ_ID }))).status
    ).toBe(200);
    const auditActions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(auditActions).toContain('PROJECT_MEDIA_ATTACH');
  });
});
