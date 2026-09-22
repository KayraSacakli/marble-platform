import type { NextResponse } from 'next/server';

// ============================================================
// Security headers
// Content Security Policy, X-Frame-Options, etc.
// Applied via Next.js middleware or config.
// ============================================================

export interface SecurityHeadersConfig {
  contentSecurityPolicy?: string;
  xFrameOptions?: string;
  xContentTypeOptions?: string;
  referrerPolicy?: string;
  strictTransportSecurity?: string;
  xXssProtection?: string;
  permissionsPolicy?: string;
}

const DEFAULT_SECURITY_HEADERS: SecurityHeadersConfig = {
  contentSecurityPolicy:
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; object-src 'none'; frame-ancestors 'none';",
  xFrameOptions: 'DENY',
  xContentTypeOptions: 'nosniff',
  referrerPolicy: 'strict-origin-when-cross-origin',
  strictTransportSecurity: 'max-age=63072000; includeSubDomains; preload',
  xXssProtection: '0',
  permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
};

/**
 * Apply security headers to a NextResponse.
 */
export function applySecurityHeaders(
  response: NextResponse,
  config: SecurityHeadersConfig = DEFAULT_SECURITY_HEADERS
): NextResponse {
  const headers = { ...DEFAULT_SECURITY_HEADERS, ...config };

  if (headers.contentSecurityPolicy) {
    response.headers.set('Content-Security-Policy', headers.contentSecurityPolicy);
  }
  if (headers.xFrameOptions) {
    response.headers.set('X-Frame-Options', headers.xFrameOptions);
  }
  if (headers.xContentTypeOptions) {
    response.headers.set('X-Content-Type-Options', headers.xContentTypeOptions);
  }
  if (headers.referrerPolicy) {
    response.headers.set('Referrer-Policy', headers.referrerPolicy);
  }
  if (headers.strictTransportSecurity) {
    response.headers.set('Strict-Transport-Security', headers.strictTransportSecurity);
  }
  if (headers.xXssProtection) {
    response.headers.set('X-XSS-Protection', headers.xXssProtection);
  }
  if (headers.permissionsPolicy) {
    response.headers.set('Permissions-Policy', headers.permissionsPolicy);
  }

  return response;
}

/**
 * Get security headers as a plain object (for middleware usage).
 */
export function getSecurityHeaders(
  config: SecurityHeadersConfig = DEFAULT_SECURITY_HEADERS
): Record<string, string> {
  const headers = { ...DEFAULT_SECURITY_HEADERS, ...config };
  const result: Record<string, string> = {};

  if (headers.contentSecurityPolicy) {
    result['Content-Security-Policy'] = headers.contentSecurityPolicy;
  }
  if (headers.xFrameOptions) {
    result['X-Frame-Options'] = headers.xFrameOptions;
  }
  if (headers.xContentTypeOptions) {
    result['X-Content-Type-Options'] = headers.xContentTypeOptions;
  }
  if (headers.referrerPolicy) {
    result['Referrer-Policy'] = headers.referrerPolicy;
  }
  if (headers.strictTransportSecurity) {
    result['Strict-Transport-Security'] = headers.strictTransportSecurity;
  }
  if (headers.xXssProtection) {
    result['X-XSS-Protection'] = headers.xXssProtection;
  }
  if (headers.permissionsPolicy) {
    result['Permissions-Policy'] = headers.permissionsPolicy;
  }

  return result;
}
