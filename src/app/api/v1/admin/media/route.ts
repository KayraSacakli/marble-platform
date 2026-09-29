import { type NextRequest } from 'next/server';
import { withAdminAuth } from '@/lib/auth/admin-handler';
import { parseQueryInt, parseQueryString } from '@/lib/api/validation';
import { ValidationError } from '@/lib/api/errors';
import { listAdminMedia, uploadAdminMedia, MAX_UPLOAD_BYTES } from '@/services/adminMedia';

// Multipart framing (boundary, part headers, extra fields) sits around the
// file bytes, so the read cap allows a little slack above the file limit.
const MULTIPART_OVERHEAD_BYTES = 64 * 1024;

// GET /api/v1/admin/media — ADMIN, EDITOR
export const GET = withAdminAuth(
  async (req: NextRequest) => {
    const url = new URL(req.url);
    return listAdminMedia({
      page: parseQueryInt(url.searchParams.get('page') ?? undefined, 1),
      pageSize: parseQueryInt(url.searchParams.get('pageSize') ?? undefined, 20),
      q: parseQueryString(url.searchParams.get('q') ?? undefined),
    });
  },
  { roles: ['ADMIN', 'EDITOR'] }
);

function uploadLimitError(): ValidationError {
  return new ValidationError(`File exceeds the ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB limit.`, []);
}

/**
 * Read the raw request body with a hard cap so an oversized upload is never
 * fully buffered in memory. Enforced on the stream itself, so a client that
 * omits (or lies about) Content-Length cannot bypass the limit.
 */
async function readBodyWithLimit(req: NextRequest): Promise<Buffer> {
  const cap = MAX_UPLOAD_BYTES + MULTIPART_OVERHEAD_BYTES;
  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > cap) {
    throw uploadLimitError();
  }

  const body = req.body;
  if (!body) {
    throw new ValidationError('Invalid multipart body.', []);
  }

  const reader = body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      total += value.byteLength;
      if (total > cap) {
        // Abandon the reader without cancelling: cancelling the platform's
        // request stream mid-pump races with its internal enqueue and can
        // surface as an unhandled ERR_INVALID_STATE rejection.
        throw uploadLimitError();
      }
      chunks.push(value);
    }
  }
  return Buffer.concat(chunks);
}

// POST /api/v1/admin/media — ADMIN, EDITOR (multipart: file)
export const POST = withAdminAuth(
  async (req: NextRequest, _ctx, admin) => {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.startsWith('multipart/form-data')) {
      throw new ValidationError('A multipart/form-data body is required.', []);
    }

    // Cap the raw body first, then parse the (already bounded) multipart form.
    const raw = await readBodyWithLimit(req);

    let form: FormData;
    try {
      form = await new Request('http://localhost/upload', {
        method: 'POST',
        headers: { 'content-type': contentType },
        body: new Uint8Array(raw),
      }).formData();
    } catch {
      throw new ValidationError('Invalid multipart body.', []);
    }

    const file = form.get('file');
    if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
      throw new ValidationError('A file field named "file" is required.', []);
    }
    const data = Buffer.from(await file.arrayBuffer());
    return uploadAdminMedia({ data, filename: file.name ?? 'upload', actorId: admin.id });
  },
  { roles: ['ADMIN', 'EDITOR'] }
);
