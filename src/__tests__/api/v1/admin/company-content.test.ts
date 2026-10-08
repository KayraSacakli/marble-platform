import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST, PATCH } from '@/app/api/v1/admin/company-content/[kind]/route';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contentItem: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    contentVariant: { findFirst: vi.fn(), findUnique: vi.fn(), create: vi.fn() },
    contentRevision: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    adminSession: { findUnique: vi.fn(), delete: vi.fn() },
    auditEvent: { create: vi.fn() },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const ADMIN = { id: 'u-admin', email: 'a@x.local', name: 'A', roles: ['ADMIN'] };
const KIND = 'ABOUT';
const CC_ID = '99999999-9999-4999-8999-999999999999';

function mockSession(user: typeof ADMIN | null) {
  vi.mocked(cookies).mockResolvedValue({
    get: (name: string) => (name === 'mp_admin_session' && user ? { value: 'tok' } : undefined),
  } as never);
  vi.mocked(prisma.adminSession.findUnique).mockResolvedValue(
    user
      ? ({
          id: 's-1',
          expiresAt: new Date(Date.now() + 60_000),
          user: { ...user, isActive: true, roles: user.roles.map((name) => ({ role: { name } })) },
        } as never)
      : null,
  );
}

function variantRow(locale: string, slug: string) {
  return {
    id: `v-${locale}`,
    locale,
    slug,
    name: `Name ${locale}`,
    description: '',
    tagline: null,
    seoTitle: null,
    seoDescription: null,
    seoCanonical: null,
    seoRobots: null,
    isFeatured: false,
    featuredOrder: null,
    displayOrder: null,
    lifecycleState: 'DRAFT',
  };
}

function makeItem() {
  return {
    id: CC_ID,
    type: 'COMPANY_CONTENT',
    aggregateState: 'DRAFT',
    companyContent: { kind: KIND },
    variants: [variantRow('tr', 'ornek-hakkimizda'), variantRow('en', 'sample-about')],
  };
}

// getContentWorkflow reads variants with their revisions included.
function makeWorkflowItem(revisions: Record<string, unknown[]> = { 'v-tr': [], 'v-en': [] }) {
  return {
    id: CC_ID,
    type: 'COMPANY_CONTENT',
    variants: ['v-tr', 'v-en'].map((vid) => ({
      id: vid,
      locale: vid === 'v-tr' ? 'tr' : 'en',
      lifecycleState: 'DRAFT',
      revisions: revisions[vid] ?? [],
    })),
  };
}

function req(method: string, body?: unknown): Request {
  return new Request('http://localhost/x', {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }) as never;
}

function ctx(kind = KIND) {
  return { params: Promise.resolve({ kind }) };
}

const validBody = {
  tr: { slug: 'ornek-hakkimizda', name: 'Hakkımızda (Örnek)' },
  en: { slug: 'sample-about', name: 'About Us (Sample)' },
};

describe('company content admin route', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSession(ADMIN);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue(null);
  });

  it('returns 401 unauthenticated', async () => {
    mockSession(null);
    expect((await GET(req('GET'), ctx())).status).toBe(401);
    expect((await POST(req('POST', validBody), ctx())).status).toBe(401);
    expect((await PATCH(req('PATCH', { tr: { name: 'x' } }), ctx())).status).toBe(401);
  });

  it('rejects an unknown kind with 400', async () => {
    expect((await GET(req('GET'), ctx('NOPE'))).status).toBe(400);
    expect((await POST(req('POST', validBody), ctx('NOPE'))).status).toBe(400);
  });

  it('validates the body with 422 and lists field details', async () => {
    const res = await POST(req('POST', { tr: { slug: 'x' } }), ctx());
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details.some((d: { field: string }) => d.field.includes('en'))).toBe(true);
  });

  it('returns 404 when the company content does not exist', async () => {
    vi.mocked(prisma.contentItem.findFirst).mockResolvedValue(null);
    const res = await GET(req('GET'), ctx());
    expect(res.status).toBe(404);
  });

  it('creates company content with revisions and audits', async () => {
    const item = makeItem();
    vi.mocked(prisma.contentItem.findFirst)
      .mockResolvedValueOnce(null) // duplicate check — nothing yet
      .mockResolvedValueOnce(item as never); // read-back for the response
    vi.mocked(prisma.contentItem.create).mockResolvedValue(item as never);
    vi.mocked(prisma.contentRevision.create).mockResolvedValue({ id: 'rev-1' } as never);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeWorkflowItem() as never);

    const res = await POST(req('POST', validBody), ctx());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.content.id).toBe(CC_ID);
    expect(body.data.content.kind).toBe(KIND);
    expect(body.data.workflow.locales.tr.openRevision).toBeNull();

    expect(vi.mocked(prisma.contentRevision.create).mock.calls).toHaveLength(2);
    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions.filter((a) => a === 'CONTENT_REVISION_CREATE')).toHaveLength(2);
    expect(actions).toContain('COMPANY_CONTENT_CREATE');
  });

  it('rejects a duplicate create with 409', async () => {
    vi.mocked(prisma.contentItem.findFirst).mockResolvedValue({ id: CC_ID } as never);
    const res = await POST(req('POST', validBody), ctx());
    expect(res.status).toBe(409);
    expect((await res.json()).error.code).toBe('CONFLICT');
    expect(vi.mocked(prisma.contentItem.create)).not.toHaveBeenCalled();
  });

  it('rejects a slug collision with 409', async () => {
    vi.mocked(prisma.contentItem.findFirst)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(makeItem() as never);
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue({ id: 'clash' } as never);
    const res = await POST(req('POST', validBody), ctx());
    expect(res.status).toBe(409);
    expect(vi.mocked(prisma.contentItem.create)).not.toHaveBeenCalled();
  });

  it('updates existing locales through an open draft revision', async () => {
    const item = makeItem();
    vi.mocked(prisma.contentItem.findFirst).mockResolvedValue(item as never);
    const openDraft = {
      id: 'rev-d',
      revisionNumber: 1,
      status: 'DRAFT',
      materialSnapshot: JSON.stringify({ slug: 'ornek-hakkimizda', name: 'Old' }),
      contentVariantId: 'v-tr',
      contentVariant: {
        id: 'v-tr',
        locale: 'tr',
        contentItemId: CC_ID,
        contentItem: { type: 'COMPANY_CONTENT' },
      },
    };
    vi.mocked(prisma.contentRevision.findFirst).mockResolvedValue(openDraft as never);
    vi.mocked(prisma.contentRevision.findUnique).mockResolvedValue(openDraft as never);
    vi.mocked(prisma.contentRevision.update).mockResolvedValue({} as never);
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeWorkflowItem() as never);

    const res = await PATCH(
      req('PATCH', { tr: { slug: 'ornek-hakkimizda', name: 'Yeni Ad' } }),
      ctx(),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.content.id).toBe(CC_ID);

    expect(vi.mocked(prisma.contentRevision.update).mock.calls.length).toBeGreaterThan(0);
    const snapshot = JSON.parse(
      vi.mocked(prisma.contentRevision.update).mock.calls[0][0].data.materialSnapshot as string,
    );
    expect(snapshot.name).toBe('Yeni Ad');
    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain('COMPANY_CONTENT_UPDATE');
  });

  it('rejects a slug collision on update with 409', async () => {
    vi.mocked(prisma.contentItem.findFirst).mockResolvedValue(makeItem() as never);
    vi.mocked(prisma.contentVariant.findFirst).mockResolvedValue({ id: 'clash' } as never);
    const res = await PATCH(req('PATCH', { tr: { slug: 'baska-slug', name: 'X' } }), ctx());
    expect(res.status).toBe(409);
    expect(vi.mocked(prisma.contentRevision.update)).not.toHaveBeenCalled();
  });
});
