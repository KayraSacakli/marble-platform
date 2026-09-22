import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ApiClient } from '@/lib/api/client';
import { ApiClientError } from '@/lib/api/client-errors';

describe('ApiClient', () => {
  let client: ApiClient;
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    client = new ApiClient({ baseUrl: 'http://localhost:3000', timeout: 5000 });
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('validateLocale', () => {
    it('accepts valid tr locale', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { test: true } }),
      });

      await client.get('tr', '/test');
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('accepts valid en locale', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { test: true } }),
      });

      await client.get('en', '/test');
      expect(fetchSpy).toHaveBeenCalled();
    });

    it('throws for invalid locale', async () => {
      await expect(
        client.get('xx' as never, '/test')
      ).rejects.toThrow('Invalid locale');
    });
  });

  describe('get', () => {
    it('builds correct URL', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { test: true } }),
      });

      await client.get('tr', '/products');
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/public/tr/products',
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('includes search params', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await client.get('tr', '/products', { page: 2, pageSize: 12 });
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/public/tr/products?page=2&pageSize=12',
        expect.anything()
      );
    });

    it('skips undefined params', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      });

      await client.get('tr', '/products', { page: 1, pageSize: undefined });
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/public/tr/products?page=1',
        expect.anything()
      );
    });
  });

  describe('error handling', () => {
    it('throws ApiClientError for HTTP 404', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: () =>
          Promise.resolve({
            error: { code: 'NOT_FOUND', message: 'Product not found' },
          }),
      });

      await expect(client.get('tr', '/products/nonexistent')).rejects.toThrow(ApiClientError);
    });

    it('throws ApiClientError for HTTP 500', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () =>
          Promise.resolve({
            error: { code: 'INTERNAL_ERROR', message: 'Server error' },
          }),
      });

      await expect(client.get('tr', '/products')).rejects.toThrow(ApiClientError);
    });

    it('throws ApiClientError for HTTP 422 with details', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: () =>
          Promise.resolve({
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Invalid input',
              details: [{ field: 'email', code: 'INVALID', message: 'Invalid email' }],
            },
          }),
      });

      try {
        await client.post('tr', '/quote-requests', { email: 'bad' });
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(ApiClientError);
        if (error instanceof ApiClientError) {
          expect(error.status).toBe(422);
          expect(error.code).toBe('VALIDATION_ERROR');
          expect(error.details).toHaveLength(1);
          expect(error.details?.[0].field).toBe('email');
        }
      }
    });

    it('throws ApiClientError for malformed JSON response', async () => {
      fetchSpy.mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(client.get('tr', '/products')).rejects.toThrow(ApiClientError);
    });
  });

  describe('post', () => {
    it('sends POST with body', async () => {
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ data: { id: '1' } }),
      });

      await client.post('tr', '/quote-requests', { name: 'Test' });
      expect(fetchSpy).toHaveBeenCalledWith(
        'http://localhost:3000/api/v1/public/tr/quote-requests',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'Test' }),
        })
      );
    });
  });

  describe('getList', () => {
    it('returns list response', async () => {
      const listData = {
        data: [{ id: '1', name: 'Product 1' }],
        meta: { page: 1, pageSize: 24, total: 1, totalPages: 1 },
      };
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(listData),
      });

      const result = await client.getList('tr', '/products');
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getOne', () => {
    it('returns single response', async () => {
      const singleData = {
        data: { id: '1', name: 'Product 1' },
      };
      fetchSpy.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(singleData),
      });

      const result = await client.getOne('tr', '/products/1');
      expect(result.data.name).toBe('Product 1');
    });
  });
});
