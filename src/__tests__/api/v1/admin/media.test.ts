import { describe, it, expect, vi, beforeEach } from 'vitest';
import os from 'node:os';
import path from 'node:path';
import { promises as fs } from 'node:fs';
import { POST as UPLOAD, GET as LIST } from '@/app/api/v1/admin/media/route';
import { GET as GET_ONE, DELETE as DELETE_ONE } from '@/app/api/v1/admin/media/[id]/route';
import {
  POST as ATTACH,
  PATCH as REORDER,
  DELETE as DETACH,
} from '@/app/api/v1/admin/products/[id]/media/route';
import { GET as SERVE } from '@/app/api/media/[key]/route';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import {
  sniffImageMime,
  sniffDimensions,
  MEDIA_PUBLIC_PREFIX,
} from '@/services/adminMedia';
import { LocalMediaStorage, setMediaStorage, assertSafeKey } from '@/lib/media/storage';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    contentItem: { findUnique: vi.fn() },
    contentVariant: { findFirst: vi.fn() },
    contentMedia: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn(), deleteMany: vi.fn(), updateMany: vi.fn(), count: vi.fn() },
    mediaAsset: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), delete: vi.fn(), count: vi.fn() },
    adminSession: { findUnique: vi.fn(), delete: vi.fn() },
    auditEvent: { create: vi.fn() },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const ADMIN = { id: 'u-admin', email: 'a@x.local', name: 'A', roles: ['ADMIN'] };
const EDITOR = { id: 'u-editor', email: 'e@x.local', name: 'E', roles: ['EDITOR'] };

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

function pngBytes(width = 2, height = 2): Buffer {
  const buf = Buffer.alloc(33, 0);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(buf, 0);
  buf.writeUInt32BE(13, 8);
  buf.write('IHDR', 12);
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  return buf;
}

const PROD_ID = '11111111-1111-4111-8111-111111111111';
const ASSET_ID = '22222222-2222-4222-8222-222222222222';

function uploadRequest(bytes: Buffer, filename: string): Request {
  const form = new FormData();
  form.append('file', new File([new Uint8Array(bytes)], filename, { type: 'application/octet-stream' }));
  return new Request('http://localhost/api/v1/admin/media', { method: 'POST', body: form }) as never;
}

describe('magic-byte sniffing and key safety', () => {
  it('detects png/jpeg/gif/webp/avif and rejects others', () => {
    expect(sniffImageMime(pngBytes())).toBe('image/png');
    expect(sniffImageMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0]))).toBe('image/jpeg');
    expect(sniffImageMime(Buffer.from('GIF89a' + '0'.repeat(10)))).toBe('image/gif');
    expect(sniffImageMime(Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP')])))
      .toBe('image/webp');
    expect(sniffImageMime(Buffer.concat([Buffer.alloc(4), Buffer.from('ftypavif'), Buffer.alloc(4)])))
      .toBe('image/avif');
    expect(sniffImageMime(Buffer.from('%PDF-1.4 fake'))).toBeNull();
    expect(sniffImageMime(Buffer.from('plain text'))).toBeNull();
  });

  it('reads png/gif dimensions', () => {
    expect(sniffDimensions(pngBytes(7, 5), 'image/png')).toEqual({ width: 7, height: 5 });
    const gif = Buffer.alloc(10, 0);
    gif.write('GIF89a', 0);
    gif.writeUInt16LE(11, 6);
    gif.writeUInt16LE(13, 8);
    expect(sniffDimensions(gif, 'image/gif')).toEqual({ width: 11, height: 13 });
  });

  it('rejects unsafe storage keys', () => {
    expect(() => assertSafeKey('../../etc/passwd')).toThrow();
    expect(() => assertSafeKey('/absolute.png')).toThrow();
    expect(() => assertSafeKey('no-extension')).toThrow();
    expect(() => assertSafeKey('11111111-1111-4111-8111-111111111111.png')).not.toThrow();
  });

  it('local storage round-trips inside an isolated root', async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), 'media-test-'));
    const storage = new LocalMediaStorage(root);
    const { key } = await storage.save(Buffer.from('hello'), 'png');
    expect(key).toMatch(/\.png$/);
    expect(key).not.toContain('hello');
    expect(await storage.read(key)).toEqual(Buffer.from('hello'));
    await storage.remove(key);
    await expect(storage.read(key)).rejects.toThrow();
    await expect(storage.read('../../x.png' as never)).rejects.toThrow();
    await fs.rm(root, { recursive: true, force: true });
  });
});

describe('admin media authZ', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('rejects unauthenticated upload/list/get/delete with 401', async () => {
    mockSession(null);
    expect((await UPLOAD(uploadRequest(pngBytes(), 'a.png'), { params: Promise.resolve({}) })).status).toBe(401);
    expect((await LIST(new Request('http://localhost/api/v1/admin/media') as never, { params: Promise.resolve({}) })).status).toBe(401);
    expect((await GET_ONE(new Request('http://localhost/x') as never, { params: Promise.resolve({ id: ASSET_ID }) })).status).toBe(401);
    expect((await DELETE_ONE(new Request('http://localhost/x', { method: 'DELETE' }) as never, { params: Promise.resolve({ id: ASSET_ID }) })).status).toBe(401);
    expect(
      (
        await ATTACH(
          new Request('http://localhost/x', { method: 'POST', body: JSON.stringify({ assetId: ASSET_ID, role: 'GALLERY' }) }) as never,
          { params: Promise.resolve({ id: PROD_ID }) }
        )
      ).status
    ).toBe(401);
  });

  it('EDITOR can upload/list/get but not delete', async () => {
    mockSession(EDITOR);
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'media-e2e-'));
    setMediaStorage(new LocalMediaStorage(dir));
    try {
      vi.mocked(prisma.mediaAsset.create).mockImplementation(async (args: never) => ({
        id: 'new-asset',
        ...(args as { data: Record<string, unknown> }).data,
        createdAt: new Date(),
      }) as never);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);

      const up = await UPLOAD(uploadRequest(pngBytes(4, 3), '../../evil.png'), { params: Promise.resolve({}) });
      expect(up.status).toBe(200);
      const upJson = await up.json();
      // Original filename is never used as storage path.
      expect(upJson.data.src).toMatch(new RegExp(`^${MEDIA_PUBLIC_PREFIX}[0-9a-f-]+\\.png$`));
      expect(upJson.data.src).not.toContain('evil');
      expect(upJson.data.width).toBe(4);
      expect(upJson.data.height).toBe(3);
      expect(JSON.stringify(upJson)).not.toContain('passwordHash');
      const created = vi.mocked(prisma.mediaAsset.create).mock.calls[0][0];
      expect(created.data.fileType).toBe('image/png');

      const del = await DELETE_ONE(new Request('http://localhost/x', { method: 'DELETE' }) as never, {
        params: Promise.resolve({ id: ASSET_ID }),
      });
      expect(del.status).toBe(403);
    } finally {
      setMediaStorage(null);
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it('rejects non-image uploads and oversized files with 422', async () => {
    mockSession(EDITOR);
    const bad = await UPLOAD(uploadRequest(Buffer.from('not an image at all'), 'x.png'), {
      params: Promise.resolve({}),
    });
    expect(bad.status).toBe(422);

    const big = await UPLOAD(uploadRequest(Buffer.alloc(6 * 1024 * 1024, 1), 'big.png'), {
      params: Promise.resolve({}),
    });
    expect(big.status).toBe(422);
  });

  it('rejects oversized streamed uploads (no content-length) with 422', async () => {
    mockSession(EDITOR);
    // A chunked body carries no content-length header, so the limit must be
    // enforced on the stream itself while reading.
    const chunk = new Uint8Array(1024 * 1024);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < 6; i++) controller.enqueue(chunk);
        controller.close();
      },
    });
    const req = new Request('http://localhost/api/v1/admin/media', {
      method: 'POST',
      headers: { 'content-type': 'multipart/form-data; boundary=testboundary' },
      body: stream,
      duplex: 'half',
    } as never);

    const res = await UPLOAD(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.error.message).toContain('MB limit');
  });

  it('ADMIN can delete unattached media and audit is written', async () => {
    mockSession(ADMIN);
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'media-del-'));
    setMediaStorage(new LocalMediaStorage(dir));
    try {
      vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue({
        id: ASSET_ID,
        sourceReference: `${MEDIA_PUBLIC_PREFIX}key.png`,
        _count: { presentations: 0 },
      } as never);
      vi.mocked(prisma.mediaAsset.delete).mockResolvedValue({} as never);
      vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);

      const res = await DELETE_ONE(new Request('http://localhost/x', { method: 'DELETE' }) as never, {
        params: Promise.resolve({ id: ASSET_ID }),
      });
      expect(res.status).toBe(200);
      const audit = vi.mocked(prisma.auditEvent.create).mock.calls[0][0];
      expect(audit.data.action).toBe('MEDIA_DELETE');
    } finally {
      setMediaStorage(null);
      await fs.rm(dir, { recursive: true, force: true });
    }
  });

  it('refuses to delete attached media with 409', async () => {
    mockSession(ADMIN);
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue({
      id: ASSET_ID,
      sourceReference: `${MEDIA_PUBLIC_PREFIX}key.png`,
      _count: { presentations: 2 },
    } as never);
    const res = await DELETE_ONE(new Request('http://localhost/x', { method: 'DELETE' }) as never, {
      params: Promise.resolve({ id: ASSET_ID }),
    });
    expect(res.status).toBe(409);
    expect(vi.mocked(prisma.mediaAsset.delete)).not.toHaveBeenCalled();
  });
});

describe('product media relations', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  function mockProduct() {
    vi.mocked(prisma.contentItem.findUnique).mockResolvedValue({
      id: PROD_ID,
      type: 'PRODUCT',
      variants: [
        { id: 'v-tr', locale: 'tr' },
        { id: 'v-en', locale: 'en' },
      ],
    } as never);
  }

  it('attaches to both variants and audits', async () => {
    mockSession(EDITOR);
    mockProduct();
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue({ id: ASSET_ID, mediaType: 'IMAGE' } as never);
    vi.mocked(prisma.contentMedia.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.contentMedia.count).mockResolvedValue(0);
    vi.mocked(prisma.contentMedia.create).mockResolvedValue({} as never);
    vi.mocked(prisma.contentMedia.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);

    const res = await ATTACH(
      new Request('http://localhost/x', {
        method: 'POST',
        body: JSON.stringify({ assetId: ASSET_ID, role: 'GALLERY', altTr: 'TR alt', altEn: 'EN alt' }),
      }) as never,
      { params: Promise.resolve({ id: PROD_ID }) }
    );
    expect(res.status).toBe(200);
    expect(vi.mocked(prisma.contentMedia.create).mock.calls).toHaveLength(2);
    const audit = vi.mocked(prisma.auditEvent.create).mock.calls[0][0];
    expect(audit.data.action).toBe('PRODUCT_MEDIA_ATTACH');
  });

  it('rejects duplicate attach with 409', async () => {
    mockSession(EDITOR);
    mockProduct();
    vi.mocked(prisma.mediaAsset.findUnique).mockResolvedValue({ id: ASSET_ID, mediaType: 'IMAGE' } as never);
    vi.mocked(prisma.contentMedia.findFirst).mockResolvedValue({ id: 'row' } as never);
    const res = await ATTACH(
      new Request('http://localhost/x', {
        method: 'POST',
        body: JSON.stringify({ assetId: ASSET_ID, role: 'GALLERY' }),
      }) as never,
      { params: Promise.resolve({ id: PROD_ID }) }
    );
    expect(res.status).toBe(409);
  });

  it('detaches and reorders with audit', async () => {
    mockSession(EDITOR);
    mockProduct();
    vi.mocked(prisma.contentMedia.deleteMany).mockResolvedValue({ count: 2 } as never);
    vi.mocked(prisma.auditEvent.create).mockResolvedValue({} as never);
    const det = await DETACH(new Request(`http://localhost/x?assetId=${ASSET_ID}`, { method: 'DELETE' }) as never, {
      params: Promise.resolve({ id: PROD_ID }),
    });
    expect(det.status).toBe(200);
    expect(vi.mocked(prisma.auditEvent.create).mock.calls[0][0].data.action).toBe('PRODUCT_MEDIA_DETACH');

    vi.mocked(prisma.contentMedia.updateMany).mockResolvedValue({ count: 1 } as never);
    vi.mocked(prisma.contentMedia.findMany).mockResolvedValue([] as never);
    const re = await REORDER(
      new Request('http://localhost/x', {
        method: 'PATCH',
        body: JSON.stringify({ items: [{ assetId: ASSET_ID, displayOrder: 0, altTr: 'Yeni' }] }),
      }) as never,
      { params: Promise.resolve({ id: PROD_ID }) }
    );
    expect(re.status).toBe(200);
    const calls = vi.mocked(prisma.contentMedia.updateMany).mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    expect(calls[0][0].data).toMatchObject({ displayOrder: 0, altText: 'Yeni' });
    const reorderAudit = vi.mocked(prisma.auditEvent.create).mock.calls.find((c) => c[0].data.action === 'PRODUCT_MEDIA_REORDER');
    expect(reorderAudit).toBeDefined();
  });
});

describe('public product gallery reads attached media', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('passes /api/media sources through the public detail contract', async () => {
    const { GET: PUBLIC_DETAIL } = await import('@/app/api/v1/public/[locale]/products/[slug]/route');
    const { contentService } = await import('@/services/content');
    const spy = vi.spyOn(contentService, 'getProductDetail').mockResolvedValue({
      id: 'p-1',
      name: 'Demo',
      slug: 'demo',
      primaryImage: {
        id: 'a-1',
        mediaType: 'image',
        src: `${MEDIA_PUBLIC_PREFIX}11111111-1111-4111-8111-111111111111.png`,
        width: 4,
        height: 3,
        aspectRatio: '4/3',
        alt: 'Demo alt',
        loading: 'lazy',
      },
      gallery: [
        {
          id: 'a-2',
          mediaType: 'image',
          src: `${MEDIA_PUBLIC_PREFIX}22222222-2222-4222-8222-222222222222.png`,
          width: 8,
          height: 6,
          aspectRatio: '8/6',
          alt: 'Gallery alt',
          loading: 'lazy',
        },
      ],
    } as never);

    const res = await PUBLIC_DETAIL(new Request('http://localhost/api/v1/public/tr/products/demo') as never, {
      params: Promise.resolve({ locale: 'tr', slug: 'demo' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.primaryImage.src).toContain('/api/media/');
    expect(json.data.gallery).toHaveLength(1);
    expect(json.data.gallery[0].alt).toBe('Gallery alt');
    spy.mockRestore();
  });
});

describe('public media serving', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('serves bytes for known assets and 404s otherwise', async () => {
    const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'media-pub-'));
    setMediaStorage(new LocalMediaStorage(dir));
    try {
      const { key } = await (await import('@/lib/media/storage')).getMediaStorage().save(pngBytes(), 'png');
      vi.mocked(prisma.mediaAsset.findFirst).mockImplementation(async (args: never) => {
        const where = (args as { where: { sourceReference: string } }).where;
        if (where.sourceReference === `${MEDIA_PUBLIC_PREFIX}${key}`) {
          return { fileType: 'image/png', fileSize: 33 } as never;
        }
        return null;
      });
      const ok = await SERVE(new Request('http://localhost/x') as never, { params: Promise.resolve({ key }) });
      expect(ok.status).toBe(200);
      expect(ok.headers.get('content-type')).toBe('image/png');

      const traversal = await SERVE(new Request('http://localhost/x') as never, {
        params: Promise.resolve({ key: '../../secret' }),
      });
      expect(traversal.status).toBe(404);

      vi.mocked(prisma.mediaAsset.findFirst).mockResolvedValue(null);
      const missing = await SERVE(new Request('http://localhost/x') as never, { params: Promise.resolve({ key }) });
      expect(missing.status).toBe(404);
    } finally {
      setMediaStorage(null);
      await fs.rm(dir, { recursive: true, force: true });
    }
  });
});
