import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  GET as COLL_MEDIA_LIST,
  POST as COLL_MEDIA_ATTACH,
  PATCH as COLL_MEDIA_REORDER,
  DELETE as COLL_MEDIA_DETACH,
} from '@/app/api/v1/admin/collections/[id]/media/route';
import {
  GET as APP_MEDIA_LIST,
  POST as APP_MEDIA_ATTACH,
  PATCH as APP_MEDIA_REORDER,
  DELETE as APP_MEDIA_DETACH,
} from '@/app/api/v1/admin/applications/[id]/media/route';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contentItem: { findUnique: vi.fn() },
    mediaAsset: { findUnique: vi.fn() },
    contentMedia: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    adminSession: { findUnique: vi.fn(), delete: vi.fn() },
    auditEvent: { create: vi.fn() },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const EDITOR = { id: 'u-editor', email: 'e@x.local', name: 'E', roles: ['EDITOR'] };
const COLL_ID = '33333333-3333-4333-8333-333333333333';
const APP_ID = '44444444-4444-4444-8444-444444444444';
const ASSET_ID = '22222222-2222-4222-8222-222222222222';

function mockSession(user: typeof EDITOR | null) {
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

function makeTaxonomy(type: 'COLLECTION' | 'APPLICATION', id: string) {
  return {
    id,
    type,
    variants: [
      { id: 'v-tr', locale: 'tr' },
      { id: 'v-en', locale: 'en' },
    ],
  };
}

function req(method: string, body?: unknown): Request {
  return new Request('http://localhost/x', {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }) as never;
}

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

const ROUTES = [
  {
    name: 'collections',
    type: 'COLLECTION' as const,
    id: COLL_ID,
    list: (r: Request, badId?: string) => COLL_MEDIA_LIST(r, ctx(badId ?? COLL_ID)),
    attach: (r: Request) => COLL_MEDIA_ATTACH(r, ctx(COLL_ID)),
    detach: (r: Request) => COLL_MEDIA_DETACH(r, ctx(COLL_ID)),
    reorder: (r: Request) => COLL_MEDIA_REORDER(r, ctx(COLL_ID)),
  },
  {
    name: 'applications',
    type: 'APPLICATION' as const,
    id: APP_ID,
    list: (r: Request, badId?: string) => APP_MEDIA_LIST(r, ctx(badId ?? APP_ID)),
    attach: (r: Request) => APP_MEDIA_ATTACH(r, ctx(APP_ID)),
    detach: (r: Request) => APP_MEDIA_DETACH(r, ctx(APP_ID)),
    reorder: (r: Request) => APP_MEDIA_REORDER(r, ctx(APP_ID)),
  },
] as const;

describe.each(ROUTES)('$name media relations', ({ type, id, list, attach, detach, reorder }) => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockSession(EDITOR);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
  });

  it('returns 401 unauthenticated for list and attach', async () => {
    mockSession(null);
    expect((await list(req('GET'))).status).toBe(401);
    expect((await attach(req('POST', { assetId: ASSET_ID, role: 'GALLERY' }))).status).toBe(401);
  });

  it('lists attached media rows', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeTaxonomy(type, id) as never);
    vi.mocked(prisma.contentMedia.findMany).mockResolvedValue([] as never);
    const res = await list(req('GET'));
    expect(res.status).toBe(200);
    expect((await res.json()).data.media).toEqual([]);
  });

  it('rejects a wrong content type with 404', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({
      id,
      type: 'PRODUCT',
      variants: [],
    } as never);
    expect((await list(req('GET'))).status).toBe(404);
  });

  it('rejects a malformed id with 400', async () => {
    expect((await list(req('GET'), 'not-a-uuid')).status).toBe(400);
  });

  it('attaches media to both locale variants and audits', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeTaxonomy(type, id) as never);
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue({
      id: ASSET_ID,
      mediaType: 'IMAGE',
    } as never);
    vi.mocked(prisma.contentMedia.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentMedia.count).mockResolvedValue(0);
    vi.mocked(prisma.contentMedia.create).mockResolvedValue({} as never);
    vi.mocked(prisma.contentMedia.findMany).mockResolvedValue([] as never);

    const res = await attach(
      req('POST', { assetId: ASSET_ID, role: 'PRIMARY', altTr: 'TR alt', altEn: 'EN alt' }),
    );
    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.contentMedia.create).mock.calls).toHaveLength(2);
    const rows = vi.mocked(prisma.contentMedia.create).mock.calls.map((c) => c[0].data);
    expect(rows[0]).toMatchObject({ contentVariantId: 'v-tr', altText: 'TR alt', role: 'PRIMARY' });
    expect(rows[1]).toMatchObject({ contentVariantId: 'v-en', altText: 'EN alt', role: 'PRIMARY' });
    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain('PRODUCT_MEDIA_ATTACH');
  });

  it('rejects duplicate attach with 409 and missing assets with 404', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeTaxonomy(type, id) as never);
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue({
      id: ASSET_ID,
      mediaType: 'IMAGE',
    } as never);
    vi.mocked(prisma.contentMedia.findFirst).mockResolvedValue({ id: 'row' } as never);
    const dup = await attach(req('POST', { assetId: ASSET_ID, role: 'GALLERY' }));
    expect(dup.status).toBe(409);

    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.contentMedia.findFirst).mockResolvedValue(null);
    const missing = await attach(req('POST', { assetId: ASSET_ID, role: 'GALLERY' }));
    expect(missing.status).toBe(404);
  });

  it('validates the attach payload with 422', async () => {
    const res = await attach(req('POST', { role: 'GALLERY' }));
    expect(res.status).toBe(422);
  });

  it('detaches and reorders with audits', async () => {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue(makeTaxonomy(type, id) as never);
    vi.mocked(prisma.contentMedia.deleteMany).mockResolvedValue({ count: 2 } as never);
    const det = await detach(
      new Request(`http://localhost/x?assetId=${ASSET_ID}`, { method: 'DELETE' }) as never,
    );
    expect(det.status).toBe(200);

    vi.mocked(prisma.contentMedia.updateMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.contentMedia.findMany).mockResolvedValue([] as never);
    const re = await reorder(
      req('PATCH', { items: [{ assetId: ASSET_ID, displayOrder: 0, altTr: 'Yeni' }] }),
    );
    expect(re.status).toBe(200);
    expect(vi.mocked(prisma.contentMedia.updateMany).mock.calls.length).toBeGreaterThan(0);
    const actions = vi.mocked(prisma.auditEvent.create).mock.calls.map((c) => c[0].data.action);
    expect(actions).toContain('PRODUCT_MEDIA_DETACH');
    expect(actions).toContain('PRODUCT_MEDIA_REORDER');
  });
});
