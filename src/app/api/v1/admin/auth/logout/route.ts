import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { withAdminAuth, handleAdminError } from '@/lib/auth/admin-handler';
import { deleteAdminSessionByToken, buildClearedSessionCookie, ADMIN_SESSION_COOKIE } from '@/lib/auth/session';

// POST /api/v1/admin/auth/logout — requires a session; clears it and the cookie.
export const POST = withAdminAuth(async () => {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    if (token) {
      await deleteAdminSessionByToken(token);
    }
    const res = NextResponse.json({ data: { loggedOut: true } }, { status: 200 });
    res.headers.append('Set-Cookie', buildClearedSessionCookie());
    return res;
  } catch (error) {
    return handleAdminError(error);
  }
});
