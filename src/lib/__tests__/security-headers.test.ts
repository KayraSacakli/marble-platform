import { describe, it, expect } from 'vitest';
import { getSecurityHeaders } from '../security/headers';

describe('getSecurityHeaders', () => {
  it('returns all default security headers', () => {
    const headers = getSecurityHeaders();
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['Strict-Transport-Security']).toContain('max-age=63072000');
    expect(headers['X-XSS-Protection']).toBe('0');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
  });

  it('allows overriding specific headers', () => {
    const headers = getSecurityHeaders({
      xFrameOptions: 'SAMEORIGIN',
    });
    expect(headers['X-Frame-Options']).toBe('SAMEORIGIN');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
  });
});
