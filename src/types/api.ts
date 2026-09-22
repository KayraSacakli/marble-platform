import type { Locale } from './locale';

// ============================================================
// Pagination
// ============================================================

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export const DEFAULT_PAGE_SIZE = 24;
export const MAX_PAGE_SIZE = 100;

// ============================================================
// API Response shapes
// ============================================================

export interface ApiResponse<T> {
  data: T;
}

export interface ApiListResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      code: string;
      message: string;
    }>;
    requestId?: string;
  };
}

// ============================================================
// Media Presentation
// ============================================================

export interface MediaPresentation {
  id: string;
  mediaType: 'image' | 'video';
  src: string;
  srcset?: string;
  widths?: number[];
  width: number;
  height: number;
  aspectRatio: string;
  alt: string;
  caption?: string;
  focalPoint?: { x: number; y: number };
  loading: 'eager' | 'lazy';
  poster?: string;
  fallbackSrc?: string;
}

// ============================================================
// SEO
// ============================================================

export interface SEOData {
  title: string;
  metaDescription: string;
  canonical: string;
  robots: 'index' | 'noindex' | 'follow' | 'nofollow';
  ogImage?: string;
  structuredData?: Record<string, unknown>;
  hreflang: Array<{ lang: string; href: string }>;
}

// ============================================================
// Content summaries
// ============================================================

export interface ContentSummary {
  id: string;
  name: string;
  slug: string;
}

export interface ProductSummary {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  primaryImage?: MediaPresentation;
  isFeatured: boolean;
}

export interface CollectionSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: MediaPresentation;
}

export interface ApplicationSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  coverImage?: MediaPresentation;
}

export interface ProjectSummary {
  id: string;
  name: string;
  slug: string;
  description?: string;
  heroImage?: MediaPresentation;
}

export interface JournalSummary {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage?: MediaPresentation;
  publicationDate: string;
  author?: string;
}

// ============================================================
// Detail responses
// ============================================================

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description: string;
  primaryImage?: MediaPresentation;
  gallery: MediaPresentation[];
  collections: ContentSummary[];
  applications: ContentSummary[];
  projects: ContentSummary[];
  relatedProducts: ProductSummary[];
  journalArticles: ContentSummary[];
  seo: SEOData;
  quoteContextIdentifier: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: MediaPresentation;
  products: ProductSummary[];
  applications: ContentSummary[];
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage?: MediaPresentation;
  products: ProductSummary[];
  projects: ContentSummary[];
  journalArticles: ContentSummary[];
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  location?: string;
  projectType?: string;
  heroImage?: MediaPresentation;
  gallery: MediaPresentation[];
  products: ProductSummary[];
  applications: ContentSummary[];
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}

export interface JournalDetail {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;
  coverImage?: MediaPresentation;
  publicationDate: string;
  author?: string;
  relatedProducts: ProductSummary[];
  relatedApplications: ContentSummary[];
  relatedProjects: ContentSummary[];
  relatedArticles: ContentSummary[];
  seo: SEOData;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// Navigation & Footer
// ============================================================

export interface NavigationItem {
  label: string;
  href: string;
  visible: boolean;
  isExternal?: boolean;
  ariaLabel?: string;
}

export interface UtilityNavigationItem {
  label: string;
  href: string;
  visible: boolean;
  type: 'language_switch' | 'cta' | 'link';
}

export interface FooterLink {
  label: string;
  href: string;
  visible: boolean;
}

export interface LanguageLink {
  label: string;
  href: string;
  active: boolean;
  available: boolean;
}

// ============================================================
// Homepage
// ============================================================

export interface CTALink {
  label: string;
  href: string;
}

export interface HeroContent {
  heading: string;
  subheading?: string;
  media?: MediaPresentation;
  fallbackImage?: MediaPresentation;
  primaryCTA: CTALink;
  secondaryCTA: CTALink;
}

export type HomepageSection =
  | { type: 'featured_products'; heading?: string; products: ProductSummary[] }
  | { type: 'featured_collections'; heading?: string; collections: CollectionSummary[] }
  | { type: 'featured_applications'; heading?: string; applications: ApplicationSummary[] }
  | { type: 'quarry_factory'; quarry?: { name: string; slug: string; coverImage?: MediaPresentation }; factory?: { name: string; slug: string; coverImage?: MediaPresentation } }
  | { type: 'featured_projects'; heading?: string; projects: ProjectSummary[] }
  | { type: 'featured_journal'; heading?: string; articles: JournalSummary[] }
  | { type: 'final_cta'; heading: string; message?: string; primaryCTA: CTALink; secondaryCTA?: CTALink };

export interface HomepageContent {
  hero: HeroContent;
  sections: HomepageSection[];
  sectionOrder: string[];
  seo: SEOData;
}

// ============================================================
// Quote Request
// ============================================================

export interface QuoteRequestResponse {
  id: string;
  submittedAt: string;
}

// ============================================================
// Request context
// ============================================================

export interface RequestContext {
  locale: Locale;
  requestId: string;
}
