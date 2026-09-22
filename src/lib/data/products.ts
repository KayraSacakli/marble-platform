import type { Locale } from '@/types/locale';
import type { ApiListResponse } from '@/types/api';
import { apiClient } from '@/lib/api/client';
import type { ProductSummary, ProductDetail } from '@/types/api';

export async function getProducts(
  locale: Locale,
  params?: Record<string, string | number>
): Promise<ApiListResponse<ProductSummary>> {
  return apiClient.getList<ProductSummary>(locale, '/products', params);
}

export async function getProduct(
  locale: Locale,
  slug: string
): Promise<ProductDetail> {
  const response = await apiClient.getOne<ProductDetail>(locale, `/products/${slug}`);
  return response.data;
}
