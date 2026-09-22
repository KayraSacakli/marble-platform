import type { Locale } from '@/types/locale';
import { apiClient } from '@/lib/api/client';
import type { HomepageContent } from '@/types/api';

export async function getHomepage(locale: Locale): Promise<HomepageContent> {
  const response = await apiClient.getOne<HomepageContent>(locale, '/homepage');
  return response.data;
}
