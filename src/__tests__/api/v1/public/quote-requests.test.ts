import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/v1/public/[locale]/quote-requests/route';
import { callHandler, mockQuoteRequestResponse } from './helpers';

vi.mock('@/services/content', () => ({
  contentService: {
    createQuoteRequest: vi.fn(),
  },
}));

const { contentService } = await import('@/services/content');

describe('POST /api/v1/public/[locale]/quote-requests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a quote request with valid data', async () => {
    (contentService.createQuoteRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockQuoteRequestResponse);

    const res = await callHandler(
      POST,
      'http://localhost/api/v1/public/tr/quote-requests',
      { locale: 'tr' },
      {
        method: 'POST',
        body: {
          contactName: 'Test User',
          contactEmail: 'test@example.invalid',
          message: 'I need a quote for marble.',
        },
      }
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.data.id).toBeDefined();
    expect(json.data.submittedAt).toBeDefined();
    expect(typeof json.data.id).toBe('string');
    expect(typeof json.data.submittedAt).toBe('string');
  });

  it('includes optional fields in quote request', async () => {
    (contentService.createQuoteRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockQuoteRequestResponse);

    const res = await callHandler(
      POST,
      'http://localhost/api/v1/public/tr/quote-requests',
      { locale: 'tr' },
      {
        method: 'POST',
        body: {
          contactName: 'Test User',
          contactEmail: 'test@example.invalid',
          contactPhone: '+90 555 123 4567',
          company: 'Test Corp',
          message: 'I need marble for a hotel project.',
          context: {
            contextKind: 'PRODUCT',
            productId: '550e8400-e29b-41d4-a716-446655440000',
          },
        },
      }
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBeDefined();
    expect(contentService.createQuoteRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        contactName: 'Test User',
        contactEmail: 'test@example.invalid',
        contactPhone: '+90 555 123 4567',
        company: 'Test Corp',
        locale: 'tr',
      })
    );
  });

  it('returns 422 for missing required fields', async () => {
    const res = await callHandler(
      POST,
      'http://localhost/api/v1/public/tr/quote-requests',
      { locale: 'tr' },
      {
        method: 'POST',
        body: { contactName: 'Test User' },
      }
    );
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.error).toBeDefined();
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(json.error.details).toBeDefined();
    expect(Array.isArray(json.error.details)).toBe(true);
    expect(json.error.details.length).toBeGreaterThan(0);
  });

  it('returns 422 for invalid email', async () => {
    const res = await callHandler(
      POST,
      'http://localhost/api/v1/public/tr/quote-requests',
      { locale: 'tr' },
      {
        method: 'POST',
        body: {
          contactName: 'Test User',
          contactEmail: 'not-an-email',
          message: 'Hello',
        },
      }
    );
    const json = await res.json();

    expect(res.status).toBe(422);
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 422 for empty message', async () => {
    const res = await callHandler(
      POST,
      'http://localhost/api/v1/public/tr/quote-requests',
      { locale: 'tr' },
      {
        method: 'POST',
        body: {
          contactName: 'Test User',
          contactEmail: 'test@example.invalid',
          message: '',
        },
      }
    );

    expect(res.status).toBe(422);
  });

  it('returns 422 for invalid context kind', async () => {
    const res = await callHandler(
      POST,
      'http://localhost/api/v1/public/tr/quote-requests',
      { locale: 'tr' },
      {
        method: 'POST',
        body: {
          contactName: 'Test User',
          contactEmail: 'test@example.invalid',
          message: 'Hello',
          context: { contextKind: 'INVALID_KIND' },
        },
      }
    );

    expect(res.status).toBe(422);
  });

  it('returns requestId in error response', async () => {
    const res = await callHandler(
      POST,
      'http://localhost/api/v1/public/tr/quote-requests',
      { locale: 'tr' },
      { method: 'POST', body: {} }
    );
    const json = await res.json();

    expect(json.error.requestId).toBeDefined();
    expect(typeof json.error.requestId).toBe('string');
  });

  it('returns requestId header on success', async () => {
    (contentService.createQuoteRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockQuoteRequestResponse);

    const res = await callHandler(
      POST,
      'http://localhost/api/v1/public/tr/quote-requests',
      { locale: 'tr' },
      {
        method: 'POST',
        body: {
          contactName: 'Test User',
          contactEmail: 'test@example.invalid',
          message: 'Hello',
        },
      }
    );

    expect(res.headers.get('x-request-id')).toBeDefined();
  });

  it('does not expose internal database errors', async () => {
    (contentService.createQuoteRequest as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error('Database connection failed')
    );

    const res = await callHandler(
      POST,
      'http://localhost/api/v1/public/tr/quote-requests',
      { locale: 'tr' },
      {
        method: 'POST',
        body: {
          contactName: 'Test User',
          contactEmail: 'test@example.invalid',
          message: 'Hello',
        },
      }
    );
    const json = await res.json();

    expect(res.status).toBe(500);
    expect(json.error).toBeDefined();
    expect(json.error.code).toBe('INTERNAL_ERROR');
    expect(json.error.message).not.toContain('Database');
    expect(json.error.message).not.toContain('connection');
  });

  it('server-controlled fields are not trusted from client', async () => {
    (contentService.createQuoteRequest as ReturnType<typeof vi.fn>).mockResolvedValue(mockQuoteRequestResponse);

    await callHandler(
      POST,
      'http://localhost/api/v1/public/tr/quote-requests',
      { locale: 'tr' },
      {
        method: 'POST',
        body: {
          contactName: 'Test User',
          contactEmail: 'test@example.invalid',
          message: 'Hello',
          id: 'fake-id',
          submittedAt: '2020-01-01',
          state: 'RESPONDED',
          locale: 'de',
        },
      }
    );

    const callArg = (contentService.createQuoteRequest as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(callArg.locale).toBe('tr');
    expect(callArg.id).toBeUndefined();
    expect(callArg.submittedAt).toBeUndefined();
    expect(callArg.state).toBeUndefined();
  });
});
