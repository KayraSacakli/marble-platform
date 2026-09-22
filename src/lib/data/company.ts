import type { Locale } from '@/types/locale';
import { apiClient } from '@/lib/api/client';
import type { MediaPresentation, SEOData } from '@/types/api';

interface CompanyContent {
  id: string;
  name: string;
  slug: string;
  content: string;
  media: MediaPresentation[];
  seo: SEOData;
}

export async function getAbout(locale: Locale): Promise<CompanyContent> {
  const response = await apiClient.getOne<CompanyContent>(locale, '/company/about');
  return response.data;
}

export async function getQuarry(locale: Locale): Promise<CompanyContent> {
  const response = await apiClient.getOne<CompanyContent>(locale, '/company/quarry');
  return response.data;
}

export async function getFactory(locale: Locale): Promise<CompanyContent> {
  const response = await apiClient.getOne<CompanyContent>(locale, '/company/factory');
  return response.data;
}
