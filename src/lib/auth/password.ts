import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

function scryptAsync(password: string, salt: Buffer, keyLength: number, options: { N: number; r: number; p: number }): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scryptCallback(password, salt, keyLength, options, (err, derivedKey) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(derivedKey as Buffer);
    });
  });
}

// scrypt parameters (interactive-login profile).
const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

const PREFIX_A = 'scrypt';
const PREFIX_B = 'v1';

/**
 * Hash a password with scrypt + random salt.
 * Stored format: scrypt$v1$n=..$r=..$p=..$<salt-b64>$<key-b64>
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const key = (await scryptAsync(password, salt, KEY_LENGTH, { N, r: R, p: P })) as Buffer;
  return `${PREFIX_A}$${PREFIX_B}$n=${N}$r=${R}$p=${P}$${salt.toString('base64')}$${key.toString('base64')}`;
}

/**
 * Verify a password against a stored hash. Returns false for any
 * malformed hash instead of throwing (safe for login flows).
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    const parts = storedHash.split('$');
    // ['scrypt','v1','n=..','r=..','p=..', salt, key]
    if (parts.length !== 7 || parts[0] !== PREFIX_A || parts[1] !== PREFIX_B) {
      return false;
    }
    const n = Number(parts[2].slice('n='.length));
    const r = Number(parts[3].slice('r='.length));
    const p = Number(parts[4].slice('p='.length));
    if (!Number.isInteger(n) || !Number.isInteger(r) || !Number.isInteger(p) || n <= 0 || r <= 0 || p <= 0) {
      return false;
    }
    const salt = Buffer.from(parts[5], 'base64');
    const expected = Buffer.from(parts[6], 'base64');
    if (salt.length === 0 || expected.length === 0) {
      return false;
    }
    const actual = (await scryptAsync(password, salt, expected.length, { N: n, r, p })) as Buffer;
    if (actual.length !== expected.length) {
      return false;
    }
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}
