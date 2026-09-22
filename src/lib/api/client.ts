import type { ApiResponse, ApiListResponse, ApiErrorResponse } from '@/types/api';
import type { Locale } from '@/types/locale';
import { SUPPORTED_LOCALES } from '@/types/locale';
import { ApiClientError, type ApiErrorCode } from './client-errors';

// ============================================================
// Configuration
// ============================================================

const DEFAULT_BASE_URL = '';
const DEFAULT_TIMEOUT = 15_000;

interface ApiClientConfig {
  baseUrl?: string;
  timeout?: number;
}

// ============================================================
// Request options
// ============================================================

interface RequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
}

// ============================================================
// API Client
// ============================================================

class ApiClient {
  private readonly baseUrl: string;
  private readonly timeout: number;

  constructor(config?: ApiClientConfig) {
    this.baseUrl = config?.baseUrl ?? DEFAULT_BASE_URL;
    this.timeout = config?.timeout ?? DEFAULT_TIMEOUT;
  }

  private validateLocale(locale: string): asserts locale is Locale {
    if (!(SUPPORTED_LOCALES as readonly string[]).includes(locale)) {
      throw new ApiClientError(
        `Invalid locale: "${locale}". Supported locales: ${SUPPORTED_LOCALES.join(', ')}`,
        400,
        'BAD_REQUEST'
      );
    }
  }

  private buildUrl(locale: Locale, path: string, searchParams?: Record<string, string | number | undefined>): string {
    const base = this.baseUrl || '';
    const urlPath = `/api/v1/public/${locale}${path}`;

    if (!searchParams || Object.keys(searchParams).length === 0) {
      return `${base}${urlPath}`;
    }

    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== '') {
        params.set(key, String(value));
      }
    }
    const qs = params.toString();
    return `${base}${urlPath}${qs ? `?${qs}` : ''}`;
  }

  private async fetchJson<T>(url: string, options?: RequestOptions & { method?: string; body?: unknown }): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const fetchInit: RequestInit = {
        method: options?.method ?? 'GET',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          ...options?.headers,
        },
        signal: options?.signal ?? controller.signal,
        cache: options?.cache,
      };

      if (options?.body) {
        fetchInit.body = JSON.stringify(options.body);
      }

      const response = await fetch(url, fetchInit);

      if (!response.ok) {
        let errorData: ApiErrorResponse['error'] | undefined;
        try {
          const body: ApiErrorResponse = await response.json();
          errorData = body.error;
        } catch {
          // Response body is not JSON
        }

        throw new ApiClientError(
          errorData?.message ?? `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          (errorData?.code ?? 'UNKNOWN') as ApiErrorCode,
          {
            details: errorData?.details,
            requestId: errorData?.requestId,
          }
        );
      }

      const data: unknown = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiClientError('Request timed out', 408, 'TIMEOUT');
      }

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new ApiClientError('Network error', 0, 'NETWORK_ERROR');
      }

      throw new ApiClientError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500,
        'INTERNAL_ERROR'
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ----------------------------------------------------------
  // Typed convenience methods
  // ----------------------------------------------------------

  async get<T>(
    locale: Locale,
    path: string,
    params?: Record<string, string | number | undefined>,
    options?: RequestOptions
  ): Promise<T> {
    this.validateLocale(locale);
    const url = this.buildUrl(locale, path, params);
    return this.fetchJson<T>(url, { ...options, method: 'GET' });
  }

  async getList<T>(
    locale: Locale,
    path: string,
    params?: Record<string, string | number | undefined>,
    options?: RequestOptions
  ): Promise<ApiListResponse<T>> {
    return this.get<ApiListResponse<T>>(locale, path, params, options);
  }

  async getOne<T>(
    locale: Locale,
    path: string,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.get<ApiResponse<T>>(locale, path, undefined, options);
  }

  async post<T>(
    locale: Locale,
    path: string,
    body: unknown,
    options?: RequestOptions
  ): Promise<T> {
    this.validateLocale(locale);
    const url = this.buildUrl(locale, path);
    return this.fetchJson<T>(url, { ...options, method: 'POST', body });
  }
}

// ============================================================
// Singleton instance
// ============================================================

export const apiClient = new ApiClient();

// ============================================================
// Types for external use
// ============================================================

export type { ApiClientConfig, RequestOptions };
export { ApiClient };
