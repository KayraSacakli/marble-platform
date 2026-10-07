import type { Locale } from '@/types/locale';

/** Public list sections that are gated per locale by published content. */
export type SeoSection = 'products' | 'collections' | 'applications' | 'projects' | 'journal';

/** Company pages that are gated per locale by published company content. */
export type SeoCompanyPage = 'about' | 'quarry' | 'factory';

/**
 * Published-content availability per locale. Drives every public SEO gate:
 * noindex, hreflang alternates and sitemap inclusion.
 */
export interface SeoAvailability {
  sections: Record<SeoSection, Locale[]>;
  company: Record<SeoCompanyPage, Locale[]>;
}
