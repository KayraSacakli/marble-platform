import { NextResponse, type NextRequest } from 'next/server';
import { createErrorResponse, isAppError, mapPrismaError, InternalError } from '@/lib/api/errors';
import { requireAdminSession, requireAdminRole, type AdminRole, type AdminSessionUser } from '@/lib/auth/session';

// ============================================================
// Admin API handler guard
//
// Wraps /api/v1/admin/* handlers with server-side authentication
// and optional role authorization:
// - unauthenticated → 401 UNAUTHORIZED
// - authenticated without an allowed role → 403 FORBIDDEN
// ============================================================

export type AdminRouteContext<P = Record<string, string>> = {
  params: Promise<P>;
};

export type AdminRouteHandler<T = unknown, P extends Record<string, string> = Record<string, string>> = (
  request: NextRequest,
  context: AdminRouteContext<P>,
  admin: AdminSessionUser
) => Promise<T | NextResponse>;

export function withAdminAuth<T = unknown, P extends Record<string, string> = Record<string, string>>(
  handler: AdminRouteHandler<T, P>,
  options?: { roles?: AdminRole[] }
) {
  return async (request: NextRequest, context: AdminRouteContext<P>): Promise<NextResponse> => {
    try {
      const admin = await requireAdminSession();
      if (options?.roles && options.roles.length > 0) {
        requireAdminRole(admin, ...options.roles);
      }
      const result = await handler(request, context, admin);
      if (result instanceof Response) {
        return result as unknown as NextResponse;
      }
      return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
      return handleAdminError(error);
    }
  };
}

/** Map thrown errors to JSON error responses (shared with public handlers). */
export function handleAdminError(error: unknown): NextResponse {
  if (isAppError(error)) {
    return createErrorResponse(error);
  }
  if (error && typeof error === 'object' && 'code' in error) {
    return createErrorResponse(mapPrismaError(error));
  }
  return createErrorResponse(new InternalError());
}
