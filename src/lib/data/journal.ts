import type { Locale } from '@/types/locale';
import type { ApiListResponse } from '@/types/api';
import { apiClient } from '@/lib/api/client';
import type { JournalSummary, JournalDetail } from '@/types/api';

export async function getJournal(
  locale: Locale,
  params?: Record<string, string | number>
): Promise<ApiListResponse<JournalSummary>> {
  return apiClient.getList<JournalSummary>(locale, '/journal', params);
}

export async function getJournalArticle(
  locale: Locale,
  slug: string
): Promise<JournalDetail> {
  const response = await apiClient.getOne<JournalDetail>(locale, `/journal/${slug}`);
  return response.data;
}
