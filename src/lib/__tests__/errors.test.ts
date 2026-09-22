import { describe, it, expect } from 'vitest';
import {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalError,
  isAppError,
  mapPrismaError,
} from '../api/errors';

describe('AppError', () => {
  it('creates an error with correct properties', () => {
    const error = new AppError('Test error', 400, 'TEST_ERROR');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_ERROR');
    expect(error.isOperational).toBe(true);
    expect(error.name).toBe('AppError');
  });

  it('serializes to JSON correctly', () => {
    const error = new AppError('Test', 400, 'TEST');
    expect(error.toJSON()).toEqual({
      code: 'TEST',
      message: 'Test',
    });
  });

  it('includes details in JSON when provided', () => {
    const details = [{ field: 'name', code: 'REQUIRED', message: 'Name is required' }];
    const error = new AppError('Validation', 422, 'VALIDATION', { details });
    const json = error.toJSON();
    expect(json.details).toEqual(details);
  });
});

describe('Specific error classes', () => {
  it('BadRequestError has 400 status', () => {
    const error = new BadRequestError();
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('BAD_REQUEST');
  });

  it('UnauthorizedError has 401 status', () => {
    const error = new UnauthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.code).toBe('UNAUTHORIZED');
  });

  it('ForbiddenError has 403 status', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.code).toBe('FORBIDDEN');
  });

  it('NotFoundError has 404 status', () => {
    const error = new NotFoundError();
    expect(error.statusCode).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
  });

  it('ConflictError has 409 status', () => {
    const error = new ConflictError();
    expect(error.statusCode).toBe(409);
    expect(error.code).toBe('CONFLICT');
  });

  it('ValidationError has 422 status and details', () => {
    const details = [{ field: 'email', code: 'INVALID', message: 'Invalid email' }];
    const error = new ValidationError('Invalid', details);
    expect(error.statusCode).toBe(422);
    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.details).toEqual(details);
  });

  it('RateLimitError has 429 status', () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
    expect(error.code).toBe('RATE_LIMITED');
  });

  it('InternalError has 500 status and is not operational', () => {
    const error = new InternalError();
    expect(error.statusCode).toBe(500);
    expect(error.code).toBe('INTERNAL_ERROR');
    expect(error.isOperational).toBe(false);
  });
});

describe('isAppError', () => {
  it('returns true for AppError instances', () => {
    expect(isAppError(new AppError('test', 400, 'TEST'))).toBe(true);
    expect(isAppError(new NotFoundError())).toBe(true);
  });

  it('returns false for non-AppError values', () => {
    expect(isAppError(new Error('test'))).toBe(false);
    expect(isAppError(null)).toBe(false);
    expect(isAppError(undefined)).toBe(false);
    expect(isAppError('string')).toBe(false);
  });
});

describe('mapPrismaError', () => {
  it('maps P2025 to NotFoundError', () => {
    const error = mapPrismaError({ code: 'P2025', message: 'Record not found' });
    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('maps P2002 to ConflictError', () => {
    const error = mapPrismaError({ code: 'P2002', message: 'Unique constraint' });
    expect(error).toBeInstanceOf(ConflictError);
  });

  it('maps unknown Prisma codes to InternalError', () => {
    const error = mapPrismaError({ code: 'P9999' });
    expect(error).toBeInstanceOf(InternalError);
  });

  it('returns InternalError for non-Prisma errors', () => {
    const error = mapPrismaError(new Error('random'));
    expect(error).toBeInstanceOf(InternalError);
  });
});
