import { NextResponse } from 'next/server';
import type { ApiErrorResponse } from '@/types/api';

// ============================================================
// App Error (base)
// ============================================================

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: Array<{
    field: string;
    code: string;
    message: string;
  }>;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    options?: {
      isOperational?: boolean;
      details?: Array<{ field: string; code: string; message: string }>;
      cause?: Error;
    }
  ) {
    super(message, { cause: options?.cause });
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = options?.isOperational ?? true;
    this.details = options?.details;
  }

  toJSON(): ApiErrorResponse['error'] {
    const payload: ApiErrorResponse['error'] = {
      code: this.code,
      message: this.message,
    };
    if (this.details && this.details.length > 0) {
      payload.details = this.details;
    }
    return payload;
  }
}

// ============================================================
// Specific error classes
// ============================================================

export class BadRequestError extends AppError {
  constructor(message = 'The request is invalid.', details?: Array<{ field: string; code: string; message: string }>) {
    super(message, 400, 'BAD_REQUEST', { details });
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication is required.') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'You do not have permission to perform this action.') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'The requested resource was not found.') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'The request conflicts with the current state.', details?: Array<{ field: string; code: string; message: string }>) {
    super(message, 409, 'CONFLICT', { details });
    this.name = 'ConflictError';
  }
}

export class ValidationError extends AppError {
  constructor(
    message = 'The request contains invalid parameters.',
    details: Array<{ field: string; code: string; message: string }>
  ) {
    super(message, 422, 'VALIDATION_ERROR', { details });
    this.name = 'ValidationError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests. Please try again later.') {
    super(message, 429, 'RATE_LIMITED');
    this.name = 'RateLimitError';
  }
}

export class InternalError extends AppError {
  constructor(message = 'An unexpected error occurred.') {
    super(message, 500, 'INTERNAL_ERROR', { isOperational: false });
    this.name = 'InternalError';
  }
}

// ============================================================
// Error response builder
// ============================================================

export function createErrorResponse(error: AppError, requestId?: string): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = {
    error: {
      ...error.toJSON(),
      ...(requestId ? { requestId } : {}),
    },
  };
  return NextResponse.json(body, { status: error.statusCode });
}

// ============================================================
// Prisma error mapping
// ============================================================

export function mapPrismaError(error: unknown): AppError {
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; message?: string };

    switch (prismaError.code) {
      case 'P2025':
        return new NotFoundError('The requested resource was not found.');
      case 'P2002':
        return new ConflictError('A resource with this value already exists.');
      case 'P2003':
        return new BadRequestError('Related resource not found.');
      case 'P2014':
        return new BadRequestError('A required relation is missing.');
      case 'P2023':
        return new BadRequestError('Invalid data format.');
      default:
        return new InternalError();
    }
  }

  return new InternalError();
}

// ============================================================
// Type guard
// ============================================================

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
