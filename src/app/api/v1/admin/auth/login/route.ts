import { NextResponse, type NextRequest } from 'next/server';
import { adminLoginSchema } from '@/lib/api/validation';
import { ValidationError } from '@/lib/api/errors';
import { enforceRateLimit, ADMIN_LOGIN_RATE_LIMIT } from '@/lib/api/rate-limit';
import { generateRequestId } from '@/lib/api/request-id';
import { loginAdmin } from '@/services/adminAuth';
import { buildSessionCookie, ADMIN_SESSION_TTL_SECONDS } from '@/lib/auth/session';
import { handleAdminError } from '@/lib/auth/admin-handler';

// POST /api/v1/admin/auth/login — public; validates credentials itself.
export async function POST(req: NextRequest): Promise<NextResponse> {
  const requestId = generateRequestId();
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  let attemptEmail: string | null = null;
  try {
    enforceRateLimit(ADMIN_LOGIN_RATE_LIMIT, req);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      throw new ValidationError('Invalid JSON body', []);
    }

    const result = adminLoginSchema.safeParse(body);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const details = Object.entries(fieldErrors).flatMap(([field, messages]) =>
        (messages ?? []).map((message) => ({ field, code: 'INVALID', message })),
      );
      throw new ValidationError('Validation failed', details);
    }

    attemptEmail = result.data.email;
    const { user, token } = await loginAdmin(result.data.email, result.data.password);
    console.log(`[${requestId}] admin.login.success email=${user.email} ip=${ip}`);

    const res = NextResponse.json(
      { data: { user } },
      { status: 200, headers: { 'x-request-id': requestId } },
    );
    res.headers.append('Set-Cookie', buildSessionCookie(token, ADMIN_SESSION_TTL_SECONDS));
    return res;
  } catch (error) {
    console.warn(
      `[${requestId}] admin.login.failure email=${attemptEmail ?? 'unknown'} ip=${ip} reason=${error instanceof Error ? error.name : 'unknown'}`,
    );
    return handleAdminError(error, requestId);
  }
}
