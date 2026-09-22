import type { Locale } from '@/types/locale';
import type { ApiListResponse } from '@/types/api';
import { apiClient } from '@/lib/api/client';
import type { ApplicationSummary, ApplicationDetail } from '@/types/api';

export async function getApplications(
  locale: Locale,
  params?: Record<string, string | number>
): Promise<ApiListResponse<ApplicationSummary>> {
  return apiClient.getList<ApplicationSummary>(locale, '/applications', params);
}

export async function getApplication(
  locale: Locale,
  slug: string
): Promise<ApplicationDetail> {
  const response = await apiClient.getOne<ApplicationDetail>(locale, `/applications/${slug}`);
  return response.data;
}
