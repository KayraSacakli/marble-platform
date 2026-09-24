import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('password hashing (scrypt)', () => {
  it('verifies a correct password', async () => {
    const hash = await hashPassword('Correct-Horse-1234');
    await expect(verifyPassword('Correct-Horse-1234', hash)).resolves.toBe(true);
  });

  it('rejects a wrong password', async () => {
    const hash = await hashPassword('Correct-Horse-1234');
    await expect(verifyPassword('wrong-password', hash)).resolves.toBe(false);
  });

  it('produces different salts per hash', async () => {
    const a = await hashPassword('same-password');
    const b = await hashPassword('same-password');
    expect(a).not.toBe(b);
    await expect(verifyPassword('same-password', a)).resolves.toBe(true);
    await expect(verifyPassword('same-password', b)).resolves.toBe(true);
  });

  it('never embeds the plaintext password', async () => {
    const hash = await hashPassword('SuperSecret123!');
    expect(hash).not.toContain('SuperSecret123!');
  });

  it('returns false for malformed hashes instead of throwing', async () => {
    await expect(verifyPassword('x', '')).resolves.toBe(false);
    await expect(verifyPassword('x', 'not-a-hash')).resolves.toBe(false);
    await expect(verifyPassword('x', 'scrypt$v1$n=abc$r=8$p=1$c2FsdA$a2V5')).resolves.toBe(false);
  });
});
