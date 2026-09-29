import { describe, it, expect } from 'vitest';
import nextConfig from '../../../next.config';

type HeaderEntry = { source: string; headers: Array<{ key: string; value: string }> };

/**
 * next.config.ts wires the (unit-tested) getSecurityHeaders() helper into the
 * build. This test guards against the helper silently becoming dead code
 * again — e.g. an empty config with no headers() hook.
 */
describe('next.config security headers wiring', () => {
  it('applies the default security headers to every route', async () => {
    const headers = await nextConfig.headers!();
    const entry = (headers as HeaderEntry[]).find((h) => h.source === '/(.*)');
    expect(entry).toBeDefined();

    const map = Object.fromEntries(entry!.headers.map((h) => [h.key, h.value]));
    expect(map['Content-Security-Policy']).toContain("default-src 'self'");
    expect(map['X-Frame-Options']).toBe('DENY');
    expect(map['X-Content-Type-Options']).toBe('nosniff');
    expect(map['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(map['Strict-Transport-Security']).toContain('max-age=63072000');
    expect(map['Permissions-Policy']).toContain('camera=()');
  });

  it('exposes a headers hook on the exported config', () => {
    expect(typeof nextConfig.headers).toBe('function');
  });
});
