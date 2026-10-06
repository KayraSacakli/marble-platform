import { describe, it, expect } from 'vitest';
import { notFoundOnlyWhenMissing } from '../api/page-errors';
import { ApiClientError } from '../api/client-errors';

function run(error: unknown): unknown {
  try {
    notFoundOnlyWhenMissing(error);
    return undefined;
  } catch (thrown) {
    return thrown;
  }
}

describe('notFoundOnlyWhenMissing', () => {
  it('converts a genuine upstream 404 into the notFound() digest', () => {
    const thrown = run(new ApiClientError('Not found', 404, 'NOT_FOUND'));
    expect(thrown).toBeInstanceOf(Error);
    expect((thrown as { digest?: string }).digest).toBe('NEXT_HTTP_ERROR_FALLBACK;404');
  });

  it('rethrows network failures unchanged (never a fake 404)', () => {
    const networkError = new ApiClientError('Network error', 0, 'NETWORK_ERROR');
    expect(run(networkError)).toBe(networkError);
  });

  it('rethrows timeouts unchanged', () => {
    const timeout = new ApiClientError('Request timed out', 408, 'TIMEOUT');
    expect(run(timeout)).toBe(timeout);
  });

  it('rethrows upstream 5xx unchanged', () => {
    const serverError = new ApiClientError('HTTP 500: Internal Server Error', 500, 'INTERNAL_ERROR');
    expect(run(serverError)).toBe(serverError);
  });

  it('rethrows unknown errors unchanged (fail closed)', () => {
    const plain = new Error('prisma connection pool exhausted');
    expect(run(plain)).toBe(plain);
    expect(run('string failure')).toBe('string failure');
  });
});
