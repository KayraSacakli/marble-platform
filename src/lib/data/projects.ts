import type { Locale } from '@/types/locale';
import type { ApiListResponse } from '@/types/api';
import { apiClient } from '@/lib/api/client';
import type { ProjectSummary, ProjectDetail } from '@/types/api';

export async function getProjects(
  locale: Locale,
  params?: Record<string, string | number>
): Promise<ApiListResponse<ProjectSummary>> {
  return apiClient.getList<ProjectSummary>(locale, '/projects', params);
}

export async function getProject(
  locale: Locale,
  slug: string
): Promise<ProjectDetail> {
  const response = await apiClient.getOne<ProjectDetail>(locale, `/projects/${slug}`);
  return response.data;
}
