import { NextResponse, type NextRequest } from 'next/server';
import { adminLoginSchema } from '@/lib/api/validation';
import { ValidationError } from '@/lib/api/errors';
import { loginAdmin } from '@/services/adminAuth';
import { buildSessionCookie, ADMIN_SESSION_TTL_SECONDS } from '@/lib/auth/session';
import { handleAdminError } from '@/lib/auth/admin-handler';

// POST /api/v1/admin/auth/login — public; validates credentials itself.
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
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
        (messages ?? []).map((message) => ({ field, code: 'INVALID', message }))
      );
      throw new ValidationError('Validation failed', details);
    }

    const { user, token } = await loginAdmin(result.data.email, result.data.password);

    const res = NextResponse.json({ data: { user } }, { status: 200 });
    res.headers.append('Set-Cookie', buildSessionCookie(token, ADMIN_SESSION_TTL_SECONDS));
    return res;
  } catch (error) {
    return handleAdminError(error);
  }
}
