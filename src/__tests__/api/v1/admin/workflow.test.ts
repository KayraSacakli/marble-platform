import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as WORKFLOW } from '@/app/api/v1/admin/products/[id]/workflow/route';
import { GET as REVISIONS, POST as NEW_DRAFT } from '@/app/api/v1/admin/products/[id]/revisions/route';
import { POST as SUBMIT } from '@/app/api/v1/admin/revisions/[revId]/submit/route';
import { POST as APPROVE } from '@/app/api/v1/admin/revisions/[revId]/approve/route';
import { POST as REJECT } from '@/app/api/v1/admin/revisions/[revId]/reject/route';
import { POST as PUBLISH } from '@/app/api/v1/admin/revisions/[revId]/publish/route';
import { POST as UNPUBLISH } from '@/app/api/v1/admin/products/[id]/unpublish/route';
import { PATCH as EDIT_PRODUCT } from '@/app/api/v1/admin/products/[id]/route';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { contentRepository } from '@/repositories/content';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contentItem: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn(), update: vi.fn() },
    contentVariant: { findFirst: vi.fn(), findUnique: vi.fn(), update: vi.fn() },
    contentRevision: { findFirst: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), create: vi.fn(), update: vi.fn() },
    contentMedia: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
    mediaAsset: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    product: { update: vi.fn() },
    approval: { create: vi.fn(), findFirst: vi.fn() },
    adminSession: { findUnique: vi.fn(), delete: vi.fn() },
    $transaction: vi.fn(),
    auditEvent: { create: vi.fn() },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const ADMIN = { id: 'u-admin', email: 'a@x.local', name: 'A', roles: ['ADMIN'] };
const EDITOR = { id: 'u-editor', email: 'e@x.local', name: 'E', roles: ['EDITOR'] };
const PROD_ID = '11111111-1111-4111-8111-111111111111';
const REV_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

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

function revisionRow(status: string, revisionNumber = 2, snapshot: Record<string, unknown> | null = { slug: 'draft-slug', name: 'Draft Name' }) {
  return {
    id: REV_ID,
    revisionNumber,
    status,
    materialSnapshot: snapshot ? JSON.stringify(snapshot) : '{}',
    contentVariantId: 'v-tr',
    contentVariant: {
      id: 'v-tr',
      locale: 'tr',
      lifecycleState: 'PUBLISHED',
      contentItemId: PROD_ID,
      contentItem: { type: 'PRODUCT', aggregateState: 'ACTIVE' },
    },
    author: { email: 'e@x.local' },
    approvals: [],
    createdAt: new Date(),
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

describe('workflow authZ', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it.each([
    ['workflow', () => WORKFLOW(new Request('http://localhost/x') as never, ctx({ id: PROD_ID }))],
    ['revisions-list', () => REVISIONS(new Request('http://localhost/x') as never, ctx({ id: PROD_ID }))],
    ['new-draft', () => NEW_DRAFT(req('http://localhost/x', 'POST', { locale: 'tr' }), ctx({ id: PROD_ID }))],
    ['submit', () => SUBMIT(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID }))],
    ['approve', () => APPROVE(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID }))],
    ['reject', () => REJECT(req('http://localhost/x', 'POST', { reason: 'no' }), ctx({ revId: REV_ID }))],
    ['publish', () => PUBLISH(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID }))],
    ['unpublish', () => UNPUBLISH(req('http://localhost/x', 'POST', { locale: 'tr' }), ctx({ id: PROD_ID }))],
  ])('%s returns 401 unauthenticated', async (_name, call) => {
    mockSession(null);
    const res = await call();
    expect(res.status).toBe(401);
  });

  it('EDITOR can submit but cannot approve/reject/publish/unpublish', async () => {
    mockSession(EDITOR);
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(revisionRow('DRAFT') as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({ ...revisionRow('IN_REVIEW'), approvals: [] } as never);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);

    const submitted = await SUBMIT(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID }));
    expect(submitted.status).toBe(200);

    for (const call of [
      APPROVE(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID })),
      REJECT(req('http://localhost/x', 'POST', { reason: 'x' }), ctx({ revId: REV_ID })),
      PUBLISH(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID })),
      UNPUBLISH(req('http://localhost/x', 'POST', { locale: 'tr' }), ctx({ id: PROD_ID })),
    ]) {
      const res = await call;
      expect(res.status).toBe(403);
    }
  });
});

describe('workflow state machine', () => {
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

  it('runs DRAFT → IN_REVIEW → APPROVED → PUBLISHED with audits', async () => {
    // submit
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(revisionRow('DRAFT') as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({ ...revisionRow('IN_REVIEW'), approvals: [] } as never);
    const submitted = await SUBMIT(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID }));
    expect(submitted.status).toBe(200);
    expect((await submitted.json()).data.revision.status).toBe('IN_REVIEW');

    // approve (+approval row with actor + locale)
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(revisionRow('IN_REVIEW') as never);
    vi.mocked(prisma.contentMedia.findMany).mockResolvedValue([{ mediaAssetId: 'm-1' }] as never);
    vi.mocked(prisma.$transaction).mockImplementation(async (ops: never) => {
      const results = [];
      for (const op of ops as unknown[]) results.push(await (op as Promise<unknown>));
      return results;
    });
    vi.mocked(prisma.approval.create).mockResolvedValue({} as never);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({ ...revisionRow('APPROVED'), approvals: [] } as never);
    const approved = await APPROVE(req('http://localhost/x', 'POST', { notes: 'looks good' }), ctx({ revId: REV_ID }));
    expect(approved.status).toBe(200);
    const approvalArg = vi.mocked(prisma.approval.create).mock.calls[0][0];
    expect(approvalArg.data.outcome).toBe('APPROVED');
    expect(approvalArg.data.approverId).toBe('u-admin');
    expect(approvalArg.data.coveredLocale).toBe('tr');

    // publish (approved + latest + approval evidence)
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(revisionRow('APPROVED') as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.approval.findFirst).mockResolvedValue({ id: 'ap-1' } as never);
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentVariant.update).mockResolvedValue({} as never);
    vi.mocked(prisma.product.update).mockResolvedValue({} as never);
    vi.mocked(prisma.contentItem.update).mockResolvedValue({} as never);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({ id: PROD_ID, type: 'PRODUCT', variants: [] } as never);
    const published = await PUBLISH(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID }));
    expect(published.status).toBe(200);

    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toEqual(
      expect.arrayContaining(['CONTENT_SUBMIT_REVIEW', 'CONTENT_APPROVE', 'CONTENT_PUBLISH'])
    );
    expect(JSON.stringify(vi.mocked(prisma.auditEvent.create).mock.calls)).not.toMatch(/password|token/i);
  });

  it('rejects invalid transitions', async () => {
    // approve a DRAFT → 409
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(revisionRow('DRAFT') as never);
    const badApprove = await APPROVE(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID }));
    expect(badApprove.status).toBe(409);

    // publish an IN_REVIEW → 409
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(revisionRow('IN_REVIEW') as never);
    const badPublish = await PUBLISH(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID }));
    expect(badPublish.status).toBe(409);

    // submit an already-submitted → 409
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(revisionRow('IN_REVIEW') as never);
    const badSubmit = await SUBMIT(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID }));
    expect(badSubmit.status).toBe(409);
  });

  it('rejects stale revisions when a newer one exists', async () => {
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(revisionRow('IN_REVIEW', 2) as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue({ id: 'newer' } as never);
    const res = await APPROVE(req('http://localhost/x', 'POST'), ctx({ revId: REV_ID }));
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('CONFLICT');
  });

  it('creates a new draft after rejection via the revisions endpoint', async () => {
    const withVariant = {
      id: PROD_ID,
      type: 'PRODUCT',
      variants: [{ id: 'v-tr', locale: 'tr' }],
    };
    const forWorkflow = {
      id: PROD_ID,
      type: 'PRODUCT',
      variants: [],
    };
    let itemCalls = 0;
    vi.mocked(prisma.contentItem.findUnique).mockImplementation(async () => {
      itemCalls += 1;
      return (itemCalls === 1 ? withVariant : forWorkflow) as never;
    });
    // Only a REJECTED (final) revision exists → no open revision → new draft.
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentVariant.findUnique).mockResolvedValue({
      id: 'v-tr',
      locale: 'tr',
      slug: 'demo',
      name: 'Demo',
      description: '',
      tagline: null,
      seoTitle: null,
      seoDescription: null,
      seoCanonical: null,
      isFeatured: false,
      featuredOrder: null,
      displayOrder: null,
      contentItem: { id: PROD_ID, product: null },
    } as never);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue({ id: 'rev-9', revisionNumber: 4 } as never);

    const res = await NEW_DRAFT(req('http://localhost/x', 'POST', { locale: 'tr' }), ctx({ id: PROD_ID }));
    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.contentRevision.create).mock.calls[0][0].data.status).toBe('DRAFT');
  });

  it('unpublishes published variants and rejects otherwise', async () => {
    const publishedItem = {
      id: PROD_ID,
      type: 'PRODUCT',
      variants: [{ id: 'v-tr', locale: 'tr', lifecycleState: 'PUBLISHED', slug: 'demo' }],
    };
    const workflowItem = {
      id: PROD_ID,
      type: 'PRODUCT',
      variants: [{ id: 'v-tr', locale: 'tr', lifecycleState: 'UNPUBLISHED', slug: 'demo', revisions: [] }],
    };
    let calls = 0;
    vi.mocked(prisma.contentItem.findUnique).mockImplementation(async () => {
      calls += 1;
      return (calls === 1 ? publishedItem : workflowItem) as never;
    });
    vi.mocked(prisma.contentVariant.update).mockResolvedValue({} as never);
    const res = await UNPUBLISH(req('http://localhost/x', 'POST', { locale: 'tr' }), ctx({ id: PROD_ID }));
    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.contentVariant.update)).toHaveBeenCalledWith(
      expect.objectContaining({ data: { lifecycleState: 'UNPUBLISHED' } })
    );
    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain('CONTENT_UNPUBLISH');

    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({
      id: PROD_ID,
      type: 'PRODUCT',
      variants: [{ id: 'v-tr', locale: 'tr', lifecycleState: 'DRAFT', slug: 'demo' }],
    } as never);
    const again = await UNPUBLISH(req('http://localhost/x', 'POST', { locale: 'tr' }), ctx({ id: PROD_ID }));
    expect(again.status).toBe(409);
  });

  it('records rejection reason and allows a new draft afterwards', async () => {
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(revisionRow('IN_REVIEW') as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({ ...revisionRow('REJECTED'), approvals: [] } as never);
    vi.mocked(prisma.approval.create).mockResolvedValue({} as never);

    const rejected = await REJECT(req('http://localhost/x', 'POST', { reason: 'Blurry photo' }), ctx({ revId: REV_ID }));
    expect(rejected.status).toBe(200);
    const approvalArg = vi.mocked(prisma.approval.create).mock.calls[0][0];
    expect(approvalArg.data.outcome).toBe('REJECTED');
    expect(approvalArg.data.notes).toBe('Blurry photo');

    // Missing reason → 422.
    const noReason = await REJECT(req('http://localhost/x', 'POST', {}), ctx({ revId: REV_ID }));
    expect(noReason.status).toBe(422);
  });

    it('blocks edits to non-draft revisions and published rows', async () => {    // PATCH products with an open APPROVED revision → 409, variant untouched.
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({
      id: PROD_ID,
      type: 'PRODUCT',
      variants: [{ id: 'v-tr', locale: 'tr', lifecycleState: 'PUBLISHED' }],
    } as never);
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue({ id: 'rev-a', status: 'APPROVED', revisionNumber: 3 } as never);
    const res = await EDIT_PRODUCT(
      req(`http://localhost/api/v1/admin/products/${PROD_ID}`, 'PATCH', { tr: { name: 'X' } }),
      { params: Promise.resolve({ id: PROD_ID }) }
    );
    expect(res.status).toBe(409);
    expect(vi.mocked(prisma.contentVariant.update)).not.toHaveBeenCalled();
  });
});

describe('public API never leaks unpublished content', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('queries gate on ACTIVE + PUBLISHED + locale', async () => {
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
    await contentRepository.findPublishedBySlug('anything', 'tr');
    const where = vi.mocked(prisma.contentVariant.findFirst).mock.calls[0][0].where;
    expect(where).toMatchObject({
      slug: 'anything',
      locale: 'tr',
      lifecycleState: 'PUBLISHED',
      contentItem: { aggregateState: 'ACTIVE' },
    });
  });

  it('does not fall back across locales', async () => {
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
    await contentRepository.findPublishedBySlug('x', 'en');
    const where = vi.mocked(prisma.contentVariant.findFirst).mock.calls[0][0].where;
    expect(where.locale).toBe('en');
  });
});

describe('7-locale admin API (Phase 19A)', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSession(ADMIN);
  });

  it('lists revisions for a non-TR/EN locale and rejects unsupported ones', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({
      id: PROD_ID,
      type: 'PRODUCT',
      variants: [{ id: 'v-de', locale: 'de' }],
    } as never);
    vi.mocked(prisma.contentRevision.findMany).mockResolvedValue([] as never);

    const ok = await REVISIONS(new Request('http://localhost/x?locale=de') as never, ctx({ id: PROD_ID }));
    expect(ok.status).toBe(200);

    const bad = await REVISIONS(new Request('http://localhost/x?locale=xx') as never, ctx({ id: PROD_ID }));
    expect(bad.status).toBe(400);
  });

  it('validates the unpublish locale against all seven supported locales', async () => {
    const accepted = await UNPUBLISH(req('http://localhost/x', 'POST', { locale: 'de' }), ctx({ id: PROD_ID }));
    expect(accepted.status).toBe(404); // locale accepted; no variant matched in the mocked database

    const rejected = await UNPUBLISH(req('http://localhost/x', 'POST', { locale: 'xx' }), ctx({ id: PROD_ID }));
    expect(rejected.status).toBe(422);
  });
});
