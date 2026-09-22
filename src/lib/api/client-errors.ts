// ============================================================
// Frontend API Error Model
//
// Maps backend API error responses to a type-safe frontend
// error representation. Does NOT expose server internals.
// ============================================================

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'
  | 'INTERNAL_ERROR'
  | 'UNKNOWN';

interface ApiClientErrorOptions {
  details?: Array<{ field: string; code: string; message: string }>;
  requestId?: string;
}

export class ApiClientError extends Error {
  public readonly status: number;
  public readonly code: ApiErrorCode;
  public readonly details?: Array<{ field: string; code: string; message: string }>;
  public readonly requestId?: string;

  constructor(message: string, status: number, code: ApiErrorCode, options?: ApiClientErrorOptions) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.details = options?.details;
    this.requestId = options?.requestId;
  }

  get isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  get isServerError(): boolean {
    return this.status >= 500;
  }

  get isNetworkError(): boolean {
    return this.status === 0 || this.code === 'NETWORK_ERROR';
  }

  get isTimeoutError(): boolean {
    return this.code === 'TIMEOUT';
  }

  get isNotFound(): boolean {
    return this.status === 404;
  }

  get isValidationError(): boolean {
    return this.status === 422;
  }

  getFieldError(fieldName: string): string | undefined {
    return this.details?.find((d) => d.field === fieldName)?.message;
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      details: this.details,
      requestId: this.requestId,
    };
  }
}

// ============================================================
// Error response type (matches backend ApiErrorResponse)
// ============================================================

export interface ApiErrorResponseData {
  error: {
    code: string;
    message: string;
    details?: Array<{ field: string; code: string; message: string }>;
    requestId?: string;
  };
}

// ============================================================
// Helper to check error types
// ============================================================

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}
