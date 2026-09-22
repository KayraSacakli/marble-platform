import type { Locale } from '@/types/locale';
import type { ApiListResponse } from '@/types/api';
import { apiClient } from '@/lib/api/client';
import type { CollectionSummary, CollectionDetail } from '@/types/api';

export async function getCollections(
  locale: Locale,
  params?: Record<string, string | number>
): Promise<ApiListResponse<CollectionSummary>> {
  return apiClient.getList<CollectionSummary>(locale, '/collections', params);
}

export async function getCollection(
  locale: Locale,
  slug: string
): Promise<CollectionDetail> {
  const response = await apiClient.getOne<CollectionDetail>(locale, `/collections/${slug}`);
  return response.data;
}
