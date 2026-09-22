import { NextResponse, type NextRequest } from 'next/server';
import { generateRequestId } from './request-id';
import { InternalError, createErrorResponse, isAppError, mapPrismaError } from './errors';
import type { RequestContext } from '@/types/api';
import { parseLocale } from './validation';

// ============================================================
// Handler types
// ============================================================

export type RouteContext<P = Record<string, string>> = {
  params: Promise<P>;
};

export type RouteHandler<T = unknown, P = Record<string, string>> = (
  request: NextRequest,
  context: RouteContext<P>,
  ctx: RequestContext
) => Promise<T>;

export type HandledResponse = NextResponse | Response;

// ============================================================
// createApiHandler
//
// Wraps a route handler with:
// - Request ID generation
// - Locale extraction and validation
// - Global error handling (AppError + Prisma + unexpected)
// - Standardized error responses
// ============================================================

export function createApiHandler<T = HandledResponse, P extends Record<string, string> = Record<string, string>>(
  handler: RouteHandler<T, P>
) {
  return async (request: NextRequest, context: RouteContext<P>): Promise<NextResponse> => {
    const requestId = generateRequestId();

    try {
      const resolvedParams = await context.params;
      const rawLocale = resolvedParams?.locale;
      const locale = parseLocale(rawLocale);

      const ctx: RequestContext = { locale, requestId };

      const result = await handler(request, context, ctx);

      if (result instanceof Response) {
        if (!result.headers.get('x-request-id')) {
          result.headers.set('x-request-id', requestId);
        }
        return result as unknown as NextResponse;
      }

      return NextResponse.json({ data: result }, { status: 200 });
    } catch (error) {
      if (isAppError(error)) {
        return createErrorResponse(error, requestId);
      }

      if (error && typeof error === 'object' && 'code' in error) {
        const appError = mapPrismaError(error);
        return createErrorResponse(appError, requestId);
      }

      console.error(`[${requestId}] Unexpected error:`, error);
      return createErrorResponse(new InternalError(), requestId);
    }
  };
}
