import { describe, it, expect, afterEach, vi } from 'vitest';
import { getSecurityHeaders } from '../security/headers';

afterEach(() => {
  vi.unstubAllEnvs();
});

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

  it("keeps 'unsafe-eval' in script-src outside production (HMR/tooling)", () => {
    const headers = getSecurityHeaders();
    expect(headers['Content-Security-Policy']).toContain("'unsafe-eval'");
  });

  it("drops 'unsafe-eval' from script-src in production (Phase 18D-4)", () => {
    vi.stubEnv('NODE_ENV', 'production');
    const headers = getSecurityHeaders();
    expect(headers['Content-Security-Policy']).toContain("script-src 'self' 'unsafe-inline';");
    expect(headers['Content-Security-Policy']).not.toContain("'unsafe-eval'");
    expect(headers['Content-Security-Policy']).toContain("default-src 'self'");
  });

  it('recomputes CSP per call (no stale module-level value)', () => {
    vi.stubEnv('NODE_ENV', 'production');
    getSecurityHeaders();
    vi.unstubAllEnvs();
    const devHeaders = getSecurityHeaders();
    expect(devHeaders['Content-Security-Policy']).toContain("'unsafe-eval'");
  });
});
