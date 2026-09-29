import { describe, it, expect } from 'vitest';
import {
  resolveSeedAdminPassword,
  DEV_ADMIN_DEFAULT_PASSWORD,
  MIN_SEED_ADMIN_PASSWORD_LENGTH,
} from '@/lib/auth/seed-password';

describe('resolveSeedAdminPassword', () => {
  it('never falls back to the known default in production', () => {
    expect(resolveSeedAdminPassword(undefined, true)).toMatchObject({ action: 'skip' });
    expect(resolveSeedAdminPassword('', true)).toMatchObject({ action: 'skip' });
    expect(resolveSeedAdminPassword('short', true)).toMatchObject({ action: 'skip' });
    expect(resolveSeedAdminPassword('x'.repeat(MIN_SEED_ADMIN_PASSWORD_LENGTH - 1), true)).toMatchObject({
      action: 'skip',
    });
  });

  it('uses a configured production password when it meets the minimum length', () => {
    const password = 'a-real-production-secret-42';
    const result = resolveSeedAdminPassword(password, true);
    expect(result).toEqual({ action: 'use', password, isDefault: false });
  });

  it('uses the documented default in development when unset or too short', () => {
    expect(resolveSeedAdminPassword(undefined, false)).toEqual({
      action: 'use',
      password: DEV_ADMIN_DEFAULT_PASSWORD,
      isDefault: true,
    });
    expect(resolveSeedAdminPassword('tooshort', false)).toEqual({
      action: 'use',
      password: DEV_ADMIN_DEFAULT_PASSWORD,
      isDefault: true,
    });
  });

  it('prefers the configured password in development when long enough', () => {
    const result = resolveSeedAdminPassword('dev-password-long-enough', false);
    expect(result).toEqual({ action: 'use', password: 'dev-password-long-enough', isDefault: false });
  });

  it('exposes the development default as a non-production value', () => {
    expect(MIN_SEED_ADMIN_PASSWORD_LENGTH).toBeGreaterThanOrEqual(12);
    expect(DEV_ADMIN_DEFAULT_PASSWORD.length).toBeGreaterThanOrEqual(MIN_SEED_ADMIN_PASSWORD_LENGTH);
  });
});
