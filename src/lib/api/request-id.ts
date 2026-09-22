import { randomUUID } from 'crypto';

const REQUEST_ID_PREFIX = 'req';

/**
 * Generate a unique request ID.
 * Format: "req_{uuid}" for easy identification and log correlation.
 */
export function generateRequestId(): string {
  return `${REQUEST_ID_PREFIX}_${randomUUID().replace(/-/g, '')}`;
}

/**
 * Extract request ID from request headers.
 * Returns existing ID if present, otherwise generates a new one.
 */
export function getOrCreateRequestId(headers: Headers): string {
  const existing = headers.get('x-request-id');
  if (existing) {
    return existing;
  }
  return generateRequestId();
}
