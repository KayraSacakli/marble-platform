import { describe, it, expect, vi } from 'vitest';
import nextConfig from '../../../next.config';

type HeaderEntry = { source: string; headers: Array<{ key: string; value: string }> };

async function resolveHeaderMap(): Promise<Record<string, string>> {
  const headers = await nextConfig.headers!();
  const entry = (headers as HeaderEntry[]).find((h) => h.source === '/(.*)');
  expect(entry).toBeDefined();
  return Object.fromEntries(entry!.headers.map((h) => [h.key, h.value]));
}

/**
 * next.config.ts wires the (unit-tested) getSecurityHeaders() helper into the
 * build. This test guards against the helper silently becoming dead code
 * again — e.g. an empty config with no headers() hook.
 */
describe('next.config security headers wiring', () => {
  it('applies the default security headers to every route', async () => {
    const map = await resolveHeaderMap();
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

  it('emits a production CSP without unsafe-eval when loaded under NODE_ENV=production (Phase 18D-4)', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('DATABASE_URL', 'postgresql://user:pass@localhost:5432/marble_platform_test');
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'http://localhost:3000');
    vi.stubEnv('NEXTAUTH_SECRET', 'a-sufficiently-long-random-secret-value');
    vi.resetModules();

    try {
      const prodConfig = (await import('../../../next.config')).default;
      const headers = await prodConfig.headers!();
      const entry = (headers as HeaderEntry[]).find((h) => h.source === '/(.*)');
      const map = Object.fromEntries(entry!.headers.map((h) => [h.key, h.value]));

      expect(map['Content-Security-Policy']).toContain("default-src 'self'");
      expect(map['Content-Security-Policy']).not.toContain("'unsafe-eval'");
    } finally {
      vi.unstubAllEnvs();
      vi.resetModules();
    }
  });
});
