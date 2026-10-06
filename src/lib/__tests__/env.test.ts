import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import {
  collectProductionEnvIssues,
  validateProductionEnv,
  validateEnv,
  type EnvLike,
} from '../env';

const validProductionEnv: EnvLike = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/marble_platform?schema=public',
  NEXT_PUBLIC_SITE_URL: 'https://www.marble-platform.com',
  NEXTAUTH_SECRET: 'f1e2d3c4b5a69788796a5b4c3d2e1f00',
};

function keysOf(env: EnvLike): string[] {
  return collectProductionEnvIssues(env).map((issue) => issue.key);
}

describe('collectProductionEnvIssues', () => {
  it('accepts a complete, valid production environment', () => {
    expect(collectProductionEnvIssues(validProductionEnv)).toEqual([]);
  });

  it('flags a missing DATABASE_URL', () => {
    const env: EnvLike = { ...validProductionEnv };
    delete env.DATABASE_URL;
    expect(keysOf(env)).toContain('DATABASE_URL');
  });

  it('flags an empty DATABASE_URL', () => {
    expect(keysOf({ ...validProductionEnv, DATABASE_URL: '  ' })).toContain('DATABASE_URL');
  });

  it('flags a non-postgres DATABASE_URL scheme', () => {
    const issues = collectProductionEnvIssues({
      ...validProductionEnv,
      DATABASE_URL: 'mysql://user:pass@localhost:3306/db',
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].key).toBe('DATABASE_URL');
    expect(issues[0].reason).toMatch(/postgres/);
  });

  it('flags an unparseable DATABASE_URL', () => {
    expect(keysOf({ ...validProductionEnv, DATABASE_URL: 'not a url' })).toContain('DATABASE_URL');
  });

  it('flags a missing NEXT_PUBLIC_SITE_URL', () => {
    const env: EnvLike = { ...validProductionEnv };
    delete env.NEXT_PUBLIC_SITE_URL;
    expect(keysOf(env)).toContain('NEXT_PUBLIC_SITE_URL');
  });

  it('flags the example.com placeholder SITE_URL', () => {
    const issues = collectProductionEnvIssues({
      ...validProductionEnv,
      NEXT_PUBLIC_SITE_URL: 'https://example.com',
    });
    expect(issues).toHaveLength(1);
    expect(issues[0].reason).toMatch(/placeholder/);
  });

  it('flags subdomains of placeholder hosts', () => {
    expect(keysOf({ ...validProductionEnv, NEXT_PUBLIC_SITE_URL: 'https://staging.example.org' })).toContain(
      'NEXT_PUBLIC_SITE_URL'
    );
    expect(keysOf({ ...validProductionEnv, NEXT_PUBLIC_SITE_URL: 'https://yourdomain.com' })).toContain(
      'NEXT_PUBLIC_SITE_URL'
    );
  });

  it('flags an invalid or non-http(s) SITE_URL', () => {
    expect(keysOf({ ...validProductionEnv, NEXT_PUBLIC_SITE_URL: 'not-a-url' })).toContain(
      'NEXT_PUBLIC_SITE_URL'
    );
    expect(keysOf({ ...validProductionEnv, NEXT_PUBLIC_SITE_URL: 'ftp://site.com' })).toContain(
      'NEXT_PUBLIC_SITE_URL'
    );
  });

  it('accepts localhost SITE_URL for local production runs', () => {
    expect(collectProductionEnvIssues({ ...validProductionEnv, NEXT_PUBLIC_SITE_URL: 'http://localhost:3100' })).toEqual(
      []
    );
  });

  it('flags a missing NEXTAUTH_SECRET', () => {
    const env: EnvLike = { ...validProductionEnv };
    delete env.NEXTAUTH_SECRET;
    expect(keysOf(env)).toContain('NEXTAUTH_SECRET');
  });

  it('flags the documented placeholder secret', () => {
    const issues = collectProductionEnvIssues({ ...validProductionEnv, NEXTAUTH_SECRET: 'your-secret-here' });
    expect(issues).toHaveLength(1);
    expect(issues[0].reason).toMatch(/placeholder/);
  });

  it('flags a too-short secret', () => {
    const issues = collectProductionEnvIssues({ ...validProductionEnv, NEXTAUTH_SECRET: 'shortsecret' });
    expect(issues).toHaveLength(1);
    expect(issues[0].reason).toMatch(/at least 16/);
  });

  it('collects every problem in one pass', () => {
    const issues = collectProductionEnvIssues({});
    expect(issues.map((issue) => issue.key).sort()).toEqual([
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'NEXT_PUBLIC_SITE_URL',
    ]);
  });
});

describe('validateProductionEnv', () => {
  it('does not throw for a valid environment', () => {
    expect(() => validateProductionEnv(validProductionEnv)).not.toThrow();
  });

  it('throws an aggregated error listing every issue', () => {
    try {
      validateProductionEnv({ NODE_ENV: 'production', NEXT_PUBLIC_SITE_URL: 'https://example.com' });
      expect.unreachable('expected validation to throw');
    } catch (error) {
      const message = (error as Error).message;
      expect(message).toContain('Production environment validation failed');
      expect(message).toContain('DATABASE_URL');
      expect(message).toContain('NEXT_PUBLIC_SITE_URL');
      expect(message).toContain('NEXTAUTH_SECRET');
      expect(message).toContain('placeholder');
    }
  });
});

describe('validateEnv (NODE_ENV gate)', () => {
  it('is a no-op in development so `next dev` keeps working', () => {
    expect(() => validateEnv({ NODE_ENV: 'development' })).not.toThrow();
    expect(() => validateEnv({ NODE_ENV: 'test' })).not.toThrow();
  });

  it('enforces production rules when NODE_ENV is production', () => {
    expect(() => validateEnv({ NODE_ENV: 'production' })).toThrow(/Production environment validation failed/);
  });
});

describe('next.config.ts wiring', () => {
  it('calls validateEnv() so build and server startup fail fast', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'next.config.ts'), 'utf8');
    expect(source).toMatch(/validateEnv\(\);/);
  });
});
