import { describe, it, expect, vi, afterEach } from 'vitest';
import HomePage from '@/app/[locale]/page';
import ProductsPage from '@/app/[locale]/products/page';
import ProductDetailPage from '@/app/[locale]/products/[slug]/page';
import { ApiClientError } from '@/lib/api/client-errors';

vi.mock('@/lib/data/homepage', () => ({
  getHomepage: vi.fn(),
}));

vi.mock('@/lib/data/products', () => ({
  getProducts: vi.fn(),
  getProduct: vi.fn(),
}));

const { getHomepage } = await import('@/lib/data/homepage');
const { getProducts, getProduct } = await import('@/lib/data/products');

const networkError = () => new ApiClientError('Network error', 0, 'NETWORK_ERROR');
const timeoutError = () => new ApiClientError('Request timed out', 408, 'TIMEOUT');
const serverError = () =>
  new ApiClientError('HTTP 500: Internal Server Error', 500, 'INTERNAL_ERROR');
const notFoundError = () => new ApiClientError('Not found', 404, 'NOT_FOUND');

const NOT_FOUND_DIGEST = 'NEXT_HTTP_ERROR_FALLBACK;404';

async function renderOrThrow(
  page: () => Promise<unknown>,
): Promise<{ rendered: boolean; error?: unknown }> {
  try {
    await page();
    return { rendered: true };
  } catch (error) {
    return { rendered: false, error };
  }
}

afterEach(() => {
  vi.mocked(getHomepage).mockReset();
  vi.mocked(getProducts).mockReset();
  vi.mocked(getProduct).mockReset();
});

describe('Temporary fetch failures propagate instead of becoming fake 404s', () => {
  it('home page rethrows a network failure (build must fail, not bake a 404)', async () => {
    const error = networkError();
    vi.mocked(getHomepage).mockRejectedValue(error);

    const result = await renderOrThrow(() =>
      HomePage({ params: Promise.resolve({ locale: 'tr' }) }),
    );

    expect(result.rendered).toBe(false);
    expect(result.error).toBe(error);
    expect((result.error as { digest?: string }).digest).toBeUndefined();
  });

  it('home page rethrows an unexpected non-ApiClient error', async () => {
    const error = new Error('connection pool exhausted');
    vi.mocked(getHomepage).mockRejectedValue(error);

    const result = await renderOrThrow(() =>
      HomePage({ params: Promise.resolve({ locale: 'en' }) }),
    );

    expect(result.error).toBe(error);
  });

  it('products list rethrows an upstream 500', async () => {
    const error = serverError();
    vi.mocked(getProducts).mockRejectedValue(error);

    const result = await renderOrThrow(() =>
      ProductsPage({
        params: Promise.resolve({ locale: 'tr' }),
        searchParams: Promise.resolve({}),
      }),
    );

    expect(result.rendered).toBe(false);
    expect(result.error).toBe(error);
  });

  it('product detail rethrows a timeout', async () => {
    const error = timeoutError();
    vi.mocked(getProduct).mockRejectedValue(error);

    const result = await renderOrThrow(() =>
      ProductDetailPage({ params: Promise.resolve({ locale: 'tr', slug: 'some-slug' }) }),
    );

    expect(result.rendered).toBe(false);
    expect(result.error).toBe(error);
  });

  it('product detail still converts a genuine 404 into the notFound digest', async () => {
    vi.mocked(getProduct).mockRejectedValue(notFoundError());

    const result = await renderOrThrow(() =>
      ProductDetailPage({ params: Promise.resolve({ locale: 'tr', slug: 'missing-slug' }) }),
    );

    expect(result.rendered).toBe(false);
    expect((result.error as { digest?: string }).digest).toBe(NOT_FOUND_DIGEST);
  });
});
