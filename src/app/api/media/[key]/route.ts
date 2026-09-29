import { prisma } from '@/lib/prisma';
import { getMediaStorage, MEDIA_PUBLIC_PREFIX } from '@/lib/media/storage';

// GET /api/media/<key> — public binary serving for managed uploads.
// The key is an unguessable UUID filename; the asset row must exist and
// be an IMAGE, otherwise 404. No filesystem paths are ever accepted.
export async function GET(_req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[a-z0-9]{3,4}$/.test(key)) {
    return new Response('Not found.', { status: 404 });
  }

  const asset = await prisma.mediaAsset.findFirst({
    where: { sourceReference: `${MEDIA_PUBLIC_PREFIX}${key}`, mediaType: 'IMAGE' },
    select: { fileType: true, fileSize: true },
  });
  if (!asset) {
    return new Response('Not found.', { status: 404 });
  }

  let data: Buffer;
  try {
    data = await getMediaStorage().read(key);
  } catch {
    return new Response('Not found.', { status: 404 });
  }

  return new Response(new Uint8Array(data), {
    status: 200,
    headers: {
      'Content-Type': asset.fileType,
      'Content-Length': String(data.length),
      // Uploaded bytes are immutable under their key.
      'Cache-Control': 'public, max-age=31536000, immutable',
      // Defense in depth: never execute uploaded bytes as code.
      'Content-Security-Policy': 'sandbox',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
