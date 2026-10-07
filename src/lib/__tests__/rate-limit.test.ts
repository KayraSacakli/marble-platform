import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getClientIp,
  checkRateLimit,
  enforceRateLimit,
  rateLimitStoreSize,
  resetRateLimits,
  ADMIN_LOGIN_RATE_LIMIT,
  PUBLIC_QUOTE_RATE_LIMIT,
  type RateLimitConfig,
} from '../api/rate-limit';
import { RateLimitError } from '../api/errors';

const cfg: RateLimitConfig = { bucket: 'unit-test', limit: 3, windowMs: 60_000 };

function req(headers: Record<string, string>): Request {
  return new Request('http://localhost/test', { method: 'GET', headers });
}

describe('getClientIp', () => {
  it('uses the last entry of x-forwarded-for', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '1.1.1.1, 2.2.2.2, 3.3.3.3' }))).toBe('3.3.3.3');
  });

  it('trims whitespace and skips empty entries', () => {
    expect(getClientIp(req({ 'x-forwarded-for': '  1.1.1.1  ,  ' }))).toBe('1.1.1.1');
    expect(getClientIp(req({ 'x-forwarded-for': '1.1.1.1,' }))).toBe('1.1.1.1');
  });

  it('falls back to x-real-ip when x-forwarded-for is absent', () => {
    expect(getClientIp(req({ 'x-real-ip': '9.9.9.9' }))).toBe('9.9.9.9');
  });

  it('returns "unknown" when no forwarding headers exist', () => {
    expect(getClientIp(req({}))).toBe('unknown');
  });

  it('caps the key part at 64 characters', () => {
    const long = 'a'.repeat(200);
    expect(getClientIp(req({ 'x-real-ip': long })).length).toBe(64);
  });
});

describe('checkRateLimit / enforceRateLimit', () => {
  beforeEach(() => {
    resetRateLimits();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetRateLimits();
  });

  it('allows exactly `limit` attempts, then denies with a positive retry', () => {
    const request = req({ 'x-forwarded-for': '10.0.0.1' });
    for (let i = 0; i < cfg.limit; i++) {
      expect(checkRateLimit(cfg, request).allowed).toBe(true);
    }
    const denied = checkRateLimit(cfg, request);
    expect(denied.allowed).toBe(false);
    expect(denied.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    expect(denied.retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it('enforceRateLimit throws RateLimitError with retryAfterSeconds once exhausted', () => {
    const request = req({ 'x-forwarded-for': '10.0.0.2' });
    for (let i = 0; i < cfg.limit; i++) {
      expect(() => enforceRateLimit(cfg, request)).not.toThrow();
    }
    try {
      enforceRateLimit(cfg, request);
      expect.unreachable('expected RateLimitError');
    } catch (error) {
      expect(error).toBeInstanceOf(RateLimitError);
      const rateLimitError = error as RateLimitError;
      expect(rateLimitError.statusCode).toBe(429);
      expect(rateLimitError.code).toBe('RATE_LIMITED');
      expect(rateLimitError.retryAfterSeconds).toBeGreaterThanOrEqual(1);
    }
  });

  it('keys counters per bucket so endpoints never share a window', () => {
    const request = req({ 'x-forwarded-for': '10.0.0.3' });
    const other: RateLimitConfig = { bucket: 'other-bucket', limit: 1, windowMs: 60_000 };
    for (let i = 0; i < cfg.limit; i++) {
      expect(checkRateLimit(cfg, request).allowed).toBe(true);
    }
    expect(checkRateLimit(cfg, request).allowed).toBe(false);
    expect(checkRateLimit(other, request).allowed).toBe(true);
  });

  it('keys counters per IP so separate clients never share a window', () => {
    const a = req({ 'x-forwarded-for': '10.0.0.4' });
    const b = req({ 'x-forwarded-for': '10.0.0.5' });
    for (let i = 0; i < cfg.limit; i++) {
      expect(checkRateLimit(cfg, a).allowed).toBe(true);
    }
    expect(checkRateLimit(cfg, a).allowed).toBe(false);
    expect(checkRateLimit(cfg, b).allowed).toBe(true);
  });

  it('resets the counter after the window elapses', () => {
    const realNow = Date.now();
    let offset = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => realNow + offset);

    const request = req({ 'x-forwarded-for': '10.0.0.6' });
    for (let i = 0; i < cfg.limit; i++) {
      expect(checkRateLimit(cfg, request).allowed).toBe(true);
    }
    expect(checkRateLimit(cfg, request).allowed).toBe(false);

    offset = cfg.windowMs + 1_000;
    expect(checkRateLimit(cfg, request).allowed).toBe(true);
  });

  it('stays bounded under a flood of unique keys', () => {
    const flood: RateLimitConfig = { bucket: 'flood', limit: 5, windowMs: 60_000 };
    for (let i = 0; i < 10_050; i++) {
      checkRateLimit(flood, req({ 'x-forwarded-for': `10.9.${(i >> 8) & 255}.${i & 255}` }));
    }
    expect(rateLimitStoreSize()).toBeLessThanOrEqual(10_000);
  });

  it('resetRateLimits clears the store', () => {
    checkRateLimit(cfg, req({ 'x-forwarded-for': '10.0.0.7' }));
    expect(rateLimitStoreSize()).toBeGreaterThan(0);
    resetRateLimits();
    expect(rateLimitStoreSize()).toBe(0);
  });
});

describe('rate limit configs', () => {
  it('matches the Phase 18D-1 budgets', () => {
    expect(ADMIN_LOGIN_RATE_LIMIT).toEqual({ bucket: 'admin-login', limit: 5, windowMs: 60_000 });
    expect(PUBLIC_QUOTE_RATE_LIMIT).toEqual({
      bucket: 'public-quote',
      limit: 10,
      windowMs: 60_000,
    });
  });
});
