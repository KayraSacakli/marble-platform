import { prisma } from '@/lib/prisma';
import { NotFoundError, ConflictError, ValidationError } from '@/lib/api/errors';
import { normalizePagination, buildPaginationMeta } from '@/lib/api/validation';
import { getMediaStorage, MEDIA_PUBLIC_PREFIX as STORAGE_PREFIX } from '@/lib/media/storage';

// ============================================================
// Admin media management (server-side, session-guarded callers)
// ============================================================

export const MEDIA_PUBLIC_PREFIX = STORAGE_PREFIX;

export const MAX_UPLOAD_BYTES = Number(process.env.MEDIA_MAX_UPLOAD_BYTES ?? 5 * 1024 * 1024);

const MIME_TO_EXT: Record<string, string> = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

/** Detect the real image type from magic bytes — never trust filename/MIME. */
export function sniffImageMime(data: Buffer): string | null {
  if (data.length >= 8 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) {
    return 'image/png';
  }
  if (data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
    return 'image/jpeg';
  }
  if (data.length >= 6 && data.toString('ascii', 0, 3) === 'GIF') {
    const version = data.toString('ascii', 3, 6);
    if (version === '87a' || version === '89a') return 'image/gif';
    return null;
  }
  if (
    data.length >= 12 &&
    data.toString('ascii', 0, 4) === 'RIFF' &&
    data.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return 'image/webp';
  }
  if (data.length >= 12 && data.toString('ascii', 4, 8) === 'ftyp') {
    const brand = data.toString('ascii', 8, 12);
    if (brand === 'avif' || brand === 'avis') return 'image/avif';
  }
  return null;
}

/** Best-effort pixel dimensions (PNG/GIF/JPEG). Null when unknown. */
export function sniffDimensions(data: Buffer, mime: string): { width: number; height: number } | null {
  try {
    if (mime === 'image/png' && data.length >= 24) {
      return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
    }
    if (mime === 'image/gif' && data.length >= 10) {
      return { width: data.readUInt16LE(6), height: data.readUInt16LE(8) };
    }
    if (mime === 'image/jpeg') {
      let offset = 2;
      while (offset + 9 < data.length) {
        if (data[offset] !== 0xff) break;
        const marker = data[offset + 1];
        // SOF0–SOF15 except DHT(0xC4), JPG(0xC8), DAC(0xCC).
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) };
        }
        if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
          offset += 2;
          continue;
        }
        const length = data.readUInt16BE(offset + 2);
        if (length < 2) break;
        offset += 2 + length;
      }
    }
  } catch {
    // Fall through to null.
  }
  return null;
}

async function writeAudit(actorId: string, action: string, details: Record<string, unknown>): Promise<void> {
  await prisma.auditEvent.create({
    data: { actorId, action, contentItemId: null, details: JSON.stringify(details) },
  });
}

export interface AdminMediaAsset {
  id: string;
  src: string;
  mime: string;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  fileSize: number | null;
  rightsState: string;
  usageCount: number;
  createdAt: string;
}

function toAdminAsset(asset: {
  id: string;
  sourceReference: string;
  fileType: string;
  width: number | null;
  height: number | null;
  aspectRatio: string | null;
  fileSize: number | null;
  rightsState: string;
  createdAt: Date;
  _count?: { presentations: number };
}): AdminMediaAsset {
  return {
    id: asset.id,
    src: asset.sourceReference,
    mime: asset.fileType,
    width: asset.width,
    height: asset.height,
    aspectRatio: asset.aspectRatio,
    fileSize: asset.fileSize,
    rightsState: asset.rightsState,
    usageCount: asset._count?.presentations ?? 0,
    createdAt: asset.createdAt.toISOString(),
  };
}

export async function listAdminMedia(options: { page?: number; pageSize?: number; q?: string }) {
  const { page, pageSize, skip } = normalizePagination({
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 20,
  });
  const q = options.q?.trim();
  const where = {
    mediaType: 'IMAGE' as const,
    ...(q ? { sourceReference: { contains: q, mode: 'insensitive' as const } } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.mediaAsset.findMany({
      where,
      include: { _count: { select: { presentations: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.mediaAsset.count({ where }),
  ]);
  return {
    data: items.map((a) => toAdminAsset(a)),
    meta: buildPaginationMeta(page, pageSize, total),
  };
}

export async function getAdminMedia(id: string) {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    include: { _count: { select: { presentations: true } } },
  });
  if (!asset) {
    throw new NotFoundError('Media not found.');
  }
  return toAdminAsset(asset);
}

export async function deleteAdminMedia(id: string, actorId: string) {
  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    include: { _count: { select: { presentations: true } } },
  });
  if (!asset) {
    throw new NotFoundError('Media not found.');
  }
  if (asset._count.presentations > 0) {
    throw new ConflictError('Media is attached to content. Detach it before deleting.');
  }
  await prisma.mediaAsset.delete({ where: { id } });
  // Best effort: remove the stored bytes. Orphan files are harmless.
  const key = keyFromSourceReference(asset.sourceReference);
  if (key) {
    try {
      await getMediaStorage().remove(key);
    } catch {
      // Ignore storage errors after the DB row is gone.
    }
  }
  await writeAudit(actorId, 'MEDIA_DELETE', { assetId: id, src: asset.sourceReference });
  return { deleted: true as const, id };
}

/** Extract the storage key from a managed `/api/media/<key>` reference. */
export function keyFromSourceReference(sourceReference: string): string | null {
  if (!sourceReference.startsWith(MEDIA_PUBLIC_PREFIX)) {
    return null;
  }
  const key = sourceReference.slice(MEDIA_PUBLIC_PREFIX.length);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{3,4}$/.test(key)) {
    return null;
  }
  return key;
}

export interface UploadInput {
  data: Buffer;
  filename: string;
  actorId: string;
}

export async function uploadAdminMedia(input: UploadInput) {
  if (input.data.length === 0) {
    throw new ValidationError('Empty file.', []);
  }
  if (input.data.length > MAX_UPLOAD_BYTES) {
    throw new ValidationError(`File exceeds the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB limit.`, []);
  }
  const mime = sniffImageMime(input.data);
  if (!mime || !MIME_TO_EXT[mime]) {
    throw new ValidationError('Only PNG, JPEG, GIF, WebP or AVIF images are allowed.', []);
  }

  const { key } = await getMediaStorage().save(input.data, MIME_TO_EXT[mime]);

  const dims = sniffDimensions(input.data, mime);
  const asset = await prisma.mediaAsset.create({
    data: {
      mediaType: 'IMAGE',
      sourceReference: `${MEDIA_PUBLIC_PREFIX}${key}`,
      rightsState: 'UNVERIFIED',
      width: dims?.width ?? null,
      height: dims?.height ?? null,
      aspectRatio: dims ? `${dims.width}/${dims.height}` : null,
      fileType: mime,
      fileSize: input.data.length,
    },
  });

  await writeAudit(input.actorId, 'MEDIA_UPLOAD', { assetId: asset.id, mime, bytes: input.data.length });
  return toAdminAsset({ ...asset, _count: { presentations: 0 } });
}

// ============================================================
// Content ↔ media relations (existing ContentMedia rows).
// Variant-level and type-agnostic; callers pass the allowed
// content types (products default preserves 17C behavior).
// ============================================================

export type ProductMediaRole = 'PRIMARY' | 'GALLERY' | 'HERO';

export type ManagedMediaType = 'PRODUCT' | 'COLLECTION' | 'APPLICATION' | 'PROJECT' | 'JOURNAL_ARTICLE';

export interface ProductMediaRow {
  rowId: string;
  variant: 'tr' | 'en';
  assetId: string;
  src: string;
  role: ProductMediaRole;
  displayOrder: number;
  altText: string | null;
  width: number | null;
  height: number | null;
}

async function findProductItemOrThrow(id: string, allowedTypes: ManagedMediaType[] = ['PRODUCT']) {
  const item = await prisma.contentItem.findUnique({
    where: { id },
    include: { variants: { select: { id: true, locale: true } } },
  });
  if (!item || !allowedTypes.includes(item.type as ManagedMediaType)) {
    throw new NotFoundError('Content not found.');
  }
  return item;
}

export async function listProductMedia(productId: string, allowedTypes: ManagedMediaType[] = ['PRODUCT']): Promise<ProductMediaRow[]> {
  const item = await findProductItemOrThrow(productId, allowedTypes);
  const variantIds = item.variants.map((v) => v.id);
  if (variantIds.length === 0) return [];
  const rows = await prisma.contentMedia.findMany({
    where: { contentVariantId: { in: variantIds } },
    include: { mediaAsset: true, contentVariant: { select: { locale: true } } },
    orderBy: [{ role: 'asc' }, { displayOrder: 'asc' }],
  });
  return rows
    .filter((r) => r.contentVariant.locale === 'tr' || r.contentVariant.locale === 'en')
    .map((r) => ({
      rowId: r.id,
      variant: r.contentVariant.locale as 'tr' | 'en',
      assetId: r.mediaAssetId,
      src: r.mediaAsset.sourceReference,
      role: r.role as ProductMediaRole,
      displayOrder: r.displayOrder,
      altText: r.altText,
      width: r.mediaAsset.width,
      height: r.mediaAsset.height,
    }));
}

function mediaAuditPrefix(itemType: string): string {
  if (itemType === 'PROJECT') return 'PROJECT';
  if (itemType === 'JOURNAL_ARTICLE') return 'JOURNAL';
  return 'PRODUCT';
}

export async function attachProductMedia(
  productId: string,
  input: { assetId: string; role: ProductMediaRole; altTr?: string; altEn?: string },
  actorId: string,
  allowedTypes: ManagedMediaType[] = ['PRODUCT']
): Promise<ProductMediaRow[]> {
  const item = await findProductItemOrThrow(productId, allowedTypes);
  const asset = await prisma.mediaAsset.findUnique({ where: { id: input.assetId } });
  if (!asset || asset.mediaType !== 'IMAGE') {
    throw new NotFoundError('Media not found.');
  }
  const variantIds = item.variants.filter((v) => v.locale === 'tr' || v.locale === 'en').map((v) => v.id);
  const clash = await prisma.contentMedia.findFirst({
    where: { contentVariantId: { in: variantIds }, mediaAssetId: input.assetId },
    select: { id: true },
  });
  if (clash) {
    throw new ConflictError('This media is already attached to the product.');
  }
  for (const variant of item.variants.filter((v) => v.locale === 'tr' || v.locale === 'en')) {
    const count = await prisma.contentMedia.count({
      where: { contentVariantId: variant.id, role: input.role as never },
    });
    await prisma.contentMedia.create({
      data: {
        contentVariantId: variant.id,
        mediaAssetId: input.assetId,
        role: input.role as never,
        displayOrder: count,
        altText: variant.locale === 'en' ? input.altEn ?? input.altTr ?? null : input.altTr ?? null,
      },
    });
  }
  await writeAudit(actorId, `${mediaAuditPrefix(item.type)}_MEDIA_ATTACH`, {
    productId,
    assetId: input.assetId,
    role: input.role,
  });
  return listProductMedia(productId, allowedTypes);
}

export async function detachProductMedia(productId: string, assetId: string, actorId: string, allowedTypes: ManagedMediaType[] = ['PRODUCT']): Promise<{ detached: true }> {
  const item = await findProductItemOrThrow(productId, allowedTypes);
  const variantIds = item.variants.map((v) => v.id);
  const removed = await prisma.contentMedia.deleteMany({
    where: { contentVariantId: { in: variantIds }, mediaAssetId: assetId },
  });
  if (removed.count === 0) {
    throw new NotFoundError('Media is not attached to this product.');
  }
  await writeAudit(actorId, `${mediaAuditPrefix(item.type)}_MEDIA_DETACH`, { productId, assetId });
  return { detached: true as const };
}

export interface ReorderItem {
  assetId: string;
  displayOrder?: number;
  altTr?: string;
  altEn?: string;
}

export async function reorderProductMedia(
  productId: string,
  items: ReorderItem[],
  actorId: string,
  allowedTypes: ManagedMediaType[] = ['PRODUCT']
): Promise<ProductMediaRow[]> {
  const item = await findProductItemOrThrow(productId, allowedTypes);
  const byLocale = new Map(item.variants.map((v) => [v.locale, v.id]));
  for (const entry of items) {
    for (const locale of ['tr', 'en'] as const) {
      const variantId = byLocale.get(locale);
      if (!variantId) continue;
      const alt = locale === 'en' ? entry.altEn ?? entry.altTr : entry.altTr;
      const data: Record<string, unknown> = {};
      if (entry.displayOrder !== undefined) data.displayOrder = entry.displayOrder;
      if (alt !== undefined) data.altText = alt === '' ? null : alt;
      if (Object.keys(data).length === 0) continue;
      await prisma.contentMedia.updateMany({
        where: { contentVariantId: variantId, mediaAssetId: entry.assetId },
        data,
      });
    }
  }
  await writeAudit(actorId, `${mediaAuditPrefix(item.type)}_MEDIA_REORDER`, {
    productId,
    items: items.map((i) => ({ assetId: i.assetId, displayOrder: i.displayOrder ?? null })),
  });
  return listProductMedia(productId, allowedTypes);
}
