import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST as LOGIN } from '@/app/api/v1/admin/auth/login/route';
import { POST as QUOTE } from '@/app/api/v1/public/[locale]/quote-requests/route';
import { loginAdmin } from '@/services/adminAuth';
import { contentService } from '@/services/content';
import { UnauthorizedError } from '@/lib/api/errors';
import { resetRateLimits } from '@/lib/api/rate-limit';
import { mockQuoteRequestResponse } from './public/helpers';

vi.mock('@/services/adminAuth', () => ({
  loginAdmin: vi.fn(),
}));

vi.mock('@/services/content', () => ({
  contentService: {
    createQuoteRequest: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    adminSession: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn(),
}));

const REQUEST_ID_PATTERN = /^req_[0-9a-f]{32}$/;

let ipSeq = 0;
function uniqueIp(): string {
  ipSeq += 1;
  return `10.77.${(ipSeq >> 8) & 255}.${ipSeq & 255}`;
}

function loginRequest(ip: string, body?: unknown): Request {
  return new Request('http://localhost/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body ?? { email: 'admin@marble-platform.local', password: 'pw' }),
  });
}

function rawLoginRequest(ip: string, body: string): Request {
  return new Request('http://localhost/api/v1/admin/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body,
  });
}

const quoteCtx = { params: Promise.resolve({ locale: 'tr' }) };

function quoteRequest(ip: string, body: unknown): Request {
  return new Request('http://localhost/api/v1/public/tr/quote-requests', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });
}

const validQuoteBody = {
  contactName: 'Test User',
  contactEmail: 'test@example.invalid',
  message: 'I need a quote for marble.',
};

function mockLoginSuccess() {
  vi.mocked(loginAdmin).mockResolvedValue({
    user: { id: 'u-1', email: 'admin@marble-platform.local', name: 'Admin', roles: ['ADMIN'] },
    token: 'raw-token',
    expiresAt: new Date(),
  });
}

describe('admin login rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    mockLoginSuccess();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetRateLimits();
  });

  it('allows up to 5 login attempts from one IP within the window', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 5; i++) {
      const res = await LOGIN(loginRequest(ip) as never);
      expect(res.status).toBe(200);
    }
    expect(loginAdmin).toHaveBeenCalledTimes(5);
  });

  it('returns 429 RATE_LIMITED in the standard error format on the 6th attempt', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 5; i++) {
      await LOGIN(loginRequest(ip) as never);
    }

    const res = await LOGIN(loginRequest(ip) as never);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error.code).toBe('RATE_LIMITED');
    expect(typeof json.error.message).toBe('string');
    expect(typeof json.error.requestId).toBe('string');
    expect(res.headers.get('x-request-id')).toBe(json.error.requestId);
  });

  it('sets Retry-After on the 429 within the window budget', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 5; i++) {
      await LOGIN(loginRequest(ip) as never);
    }

    const res = await LOGIN(loginRequest(ip) as never);
    const retryAfter = Number(res.headers.get('retry-after'));

    expect(Number.isInteger(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThanOrEqual(1);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });

  it('sets no session cookie on the 429', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 5; i++) {
      await LOGIN(loginRequest(ip) as never);
    }

    const res = await LOGIN(loginRequest(ip) as never);
    expect(res.status).toBe(429);
    expect(res.headers.get('set-cookie')).toBeNull();
  });

  it('limits before parsing the body or checking credentials', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 5; i++) {
      await LOGIN(loginRequest(ip) as never);
    }

    const res = await LOGIN(rawLoginRequest(ip, 'not-json{{'));

    expect(res.status).toBe(429);
    expect(loginAdmin).toHaveBeenCalledTimes(5);
  });

  it('counts failed attempts toward the limit', async () => {
    vi.mocked(loginAdmin).mockRejectedValue(new UnauthorizedError('Invalid email or password.'));
    const ip = uniqueIp();

    for (let i = 0; i < 5; i++) {
      const res = await LOGIN(loginRequest(ip) as never);
      expect(res.status).toBe(401);
    }

    const res = await LOGIN(loginRequest(ip) as never);
    expect(res.status).toBe(429);
    expect(loginAdmin).toHaveBeenCalledTimes(5);
  });

  it('gives each IP its own bucket', async () => {
    const exhausted = uniqueIp();
    const fresh = uniqueIp();
    for (let i = 0; i < 5; i++) {
      await LOGIN(loginRequest(exhausted) as never);
    }

    const blocked = await LOGIN(loginRequest(exhausted) as never);
    const allowed = await LOGIN(loginRequest(fresh) as never);

    expect(blocked.status).toBe(429);
    expect(allowed.status).toBe(200);
  });

  it('sets x-request-id on successful logins', async () => {
    const res = await LOGIN(loginRequest(uniqueIp()) as never);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toMatch(REQUEST_ID_PATTERN);
  });

  it('sets x-request-id on credential errors', async () => {
    vi.mocked(loginAdmin).mockRejectedValue(new UnauthorizedError('Invalid email or password.'));

    const res = await LOGIN(loginRequest(uniqueIp()) as never);
    const json = await res.json();

    expect(res.status).toBe(401);
    expect(res.headers.get('x-request-id')).toMatch(REQUEST_ID_PATTERN);
    expect(res.headers.get('x-request-id')).toBe(json.error.requestId);
  });

  it('allows again after the window elapses', async () => {
    const realNow = Date.now();
    let offset = 0;
    vi.spyOn(Date, 'now').mockImplementation(() => realNow + offset);
    const ip = uniqueIp();

    for (let i = 0; i < 5; i++) {
      await LOGIN(loginRequest(ip) as never);
    }
    expect((await LOGIN(loginRequest(ip) as never)).status).toBe(429);

    offset = 61_000;
    expect((await LOGIN(loginRequest(ip) as never)).status).toBe(200);
  });
});

describe('public quote rate limiting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetRateLimits();
    vi.mocked(contentService.createQuoteRequest).mockResolvedValue(mockQuoteRequestResponse);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetRateLimits();
  });

  it('allows up to 10 quote submissions from one IP within the window', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 10; i++) {
      const res = await QUOTE(quoteRequest(ip, validQuoteBody) as never, quoteCtx);
      expect(res.status).toBe(200);
    }
    expect(contentService.createQuoteRequest).toHaveBeenCalledTimes(10);
  });

  it('returns 429 RATE_LIMITED in the standard error format on the 11th attempt', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 10; i++) {
      await QUOTE(quoteRequest(ip, validQuoteBody) as never, quoteCtx);
    }

    const res = await QUOTE(quoteRequest(ip, validQuoteBody) as never, quoteCtx);
    const json = await res.json();

    expect(res.status).toBe(429);
    expect(json.error.code).toBe('RATE_LIMITED');
    expect(typeof json.error.message).toBe('string');
    expect(typeof json.error.requestId).toBe('string');
    expect(res.headers.get('x-request-id')).toBe(json.error.requestId);
  });

  it('sets Retry-After on the 429 within the window budget', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 10; i++) {
      await QUOTE(quoteRequest(ip, validQuoteBody) as never, quoteCtx);
    }

    const res = await QUOTE(quoteRequest(ip, validQuoteBody) as never, quoteCtx);
    const retryAfter = Number(res.headers.get('retry-after'));

    expect(Number.isInteger(retryAfter)).toBe(true);
    expect(retryAfter).toBeGreaterThanOrEqual(1);
    expect(retryAfter).toBeLessThanOrEqual(60);
  });

  it('creates no quote request once limited', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 11; i++) {
      await QUOTE(quoteRequest(ip, validQuoteBody) as never, quoteCtx);
    }
    expect(contentService.createQuoteRequest).toHaveBeenCalledTimes(10);
  });

  it('limits before validating the body', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 10; i++) {
      await QUOTE(quoteRequest(ip, validQuoteBody) as never, quoteCtx);
    }

    const res = await QUOTE(quoteRequest(ip, { contactName: 'Test User' }) as never, quoteCtx);
    expect(res.status).toBe(429);
  });

  it('gives each IP its own bucket', async () => {
    const exhausted = uniqueIp();
    const fresh = uniqueIp();
    for (let i = 0; i < 11; i++) {
      await QUOTE(quoteRequest(exhausted, validQuoteBody) as never, quoteCtx);
    }

    const blocked = await QUOTE(quoteRequest(exhausted, validQuoteBody) as never, quoteCtx);
    const allowed = await QUOTE(quoteRequest(fresh, validQuoteBody) as never, quoteCtx);

    expect(blocked.status).toBe(429);
    expect(allowed.status).toBe(200);
  });

  it('keeps login and quote buckets independent for the same IP', async () => {
    const ip = uniqueIp();
    for (let i = 0; i < 5; i++) {
      await LOGIN(loginRequest(ip) as never);
    }
    expect((await LOGIN(loginRequest(ip) as never)).status).toBe(429);

    const res = await QUOTE(quoteRequest(ip, validQuoteBody) as never, quoteCtx);
    expect(res.status).toBe(200);
  });

  it('sets x-request-id on successful quote submissions', async () => {
    const res = await QUOTE(quoteRequest(uniqueIp(), validQuoteBody) as never, quoteCtx);
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toMatch(REQUEST_ID_PATTERN);
  });

  it('sets x-request-id on validation errors', async () => {
    const res = await QUOTE(quoteRequest(uniqueIp(), { contactName: 'Test User' }) as never, quoteCtx);
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(res.headers.get('x-request-id')).toMatch(REQUEST_ID_PATTERN);
    expect(res.headers.get('x-request-id')).toBe(json.error.requestId);
  });
});
