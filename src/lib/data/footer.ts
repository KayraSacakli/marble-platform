import type { Locale } from '@/types/locale';
import { apiClient } from '@/lib/api/client';
import type { FooterLink, LanguageLink } from '@/types/api';

interface FooterData {
  company: FooterLink[];
  catalogue: FooterLink[];
  conversion: FooterLink[];
  legal: FooterLink[];
  language: LanguageLink[];
  copyright: string;
}

export async function getFooter(locale: Locale): Promise<FooterData> {
  const response = await apiClient.getOne<FooterData>(locale, '/footer');
  return response.data;
}
