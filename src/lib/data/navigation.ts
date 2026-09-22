import type { Locale } from '@/types/locale';
import { apiClient } from '@/lib/api/client';
import type { NavigationItem, UtilityNavigationItem } from '@/types/api';

interface NavigationData {
  primary: NavigationItem[];
  utility: UtilityNavigationItem[];
  projectsVisible: boolean;
}

export async function getNavigation(locale: Locale): Promise<NavigationData> {
  const response = await apiClient.getOne<NavigationData>(locale, '/navigation');
  return response.data;
}
