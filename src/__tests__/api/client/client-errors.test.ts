import { describe, it, expect } from 'vitest';
import { ApiClientError, isApiClientError } from '@/lib/api/client-errors';

describe('ApiClientError', () => {
  it('creates error with status and code', () => {
    const error = new ApiClientError('Not found', 404, 'NOT_FOUND');
    expect(error.message).toBe('Not found');
    expect(error.status).toBe(404);
    expect(error.code).toBe('NOT_FOUND');
    expect(error.name).toBe('ApiClientError');
  });

  it('creates error with details', () => {
    const details = [{ field: 'email', code: 'INVALID', message: 'Invalid email' }];
    const error = new ApiClientError('Validation failed', 422, 'VALIDATION_ERROR', { details });
    expect(error.details).toEqual(details);
  });

  it('creates error with requestId', () => {
    const error = new ApiClientError('Error', 500, 'INTERNAL_ERROR', { requestId: 'req_123' });
    expect(error.requestId).toBe('req_123');
  });

  it('isClientError returns true for 4xx', () => {
    expect(new ApiClientError('Bad', 400, 'BAD_REQUEST').isClientError).toBe(true);
    expect(new ApiClientError('Not found', 404, 'NOT_FOUND').isClientError).toBe(true);
    expect(new ApiClientError('Validation', 422, 'VALIDATION_ERROR').isClientError).toBe(true);
  });

  it('isClientError returns false for 5xx', () => {
    expect(new ApiClientError('Server error', 500, 'INTERNAL_ERROR').isClientError).toBe(false);
  });

  it('isServerError returns true for 5xx', () => {
    expect(new ApiClientError('Server error', 500, 'INTERNAL_ERROR').isServerError).toBe(true);
  });

  it('isNetworkError returns true for status 0', () => {
    expect(new ApiClientError('Network', 0, 'NETWORK_ERROR').isNetworkError).toBe(true);
  });

  it('isTimeoutError returns true for TIMEOUT code', () => {
    expect(new ApiClientError('Timeout', 408, 'TIMEOUT').isTimeoutError).toBe(true);
  });

  it('isNotFound returns true for 404', () => {
    expect(new ApiClientError('Not found', 404, 'NOT_FOUND').isNotFound).toBe(true);
  });

  it('isValidationError returns true for 422', () => {
    expect(new ApiClientError('Validation', 422, 'VALIDATION_ERROR').isValidationError).toBe(true);
  });

  it('getFieldError returns matching field message', () => {
    const details = [
      { field: 'email', code: 'INVALID', message: 'Invalid email' },
      { field: 'name', code: 'REQUIRED', message: 'Name is required' },
    ];
    const error = new ApiClientError('Validation', 422, 'VALIDATION_ERROR', { details });
    expect(error.getFieldError('email')).toBe('Invalid email');
    expect(error.getFieldError('name')).toBe('Name is required');
    expect(error.getFieldError('phone')).toBeUndefined();
  });

  it('toJSON returns structured error', () => {
    const error = new ApiClientError('Not found', 404, 'NOT_FOUND', { requestId: 'req_1' });
    const json = error.toJSON();
    expect(json).toEqual({
      name: 'ApiClientError',
      message: 'Not found',
      status: 404,
      code: 'NOT_FOUND',
      details: undefined,
      requestId: 'req_1',
    });
  });
});

describe('isApiClientError', () => {
  it('returns true for ApiClientError', () => {
    const error = new ApiClientError('test', 400, 'BAD_REQUEST');
    expect(isApiClientError(error)).toBe(true);
  });

  it('returns false for regular Error', () => {
    expect(isApiClientError(new Error('test'))).toBe(false);
  });

  it('returns false for null', () => {
    expect(isApiClientError(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isApiClientError(undefined)).toBe(false);
  });
});
