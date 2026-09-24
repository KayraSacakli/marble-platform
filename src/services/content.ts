import { contentRepository } from '../repositories/content';
import type { Locale } from '@/types/locale';
import type {
  ProductSummary,
  ContentSummary,
  CollectionSummary,
  ApplicationSummary,
  ProjectSummary,
  JournalSummary,
  MediaPresentation,
  SEOData,
  HomepageContent,
  HomepageSection,
} from '@/types/api';
import { NotFoundError } from '@/lib/api/errors';
import { buildSEOData, buildCanonical } from '@/lib/api/seo';

const SITE_NAME = 'Premium Turkish Marble';

// ============================================================
// Helpers to extract published variant from a content item
// ============================================================

function findPublishedVariant(contentItem: {
  variants?: Array<{
    id: string;
    locale: string;
    lifecycleState: string;
    name?: string | null;
    slug: string;
    description?: string | null;
    tagline?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoCanonical?: string | null;
    seoRobots?: string | null;
    isFeatured: boolean;
    displayOrder?: number | null;
    featuredOrder?: number | null;
    mediaPresentations?: Array<{
      role: string;
      altText?: string | null;
      caption?: string | null;
      focalPointX?: number | null;
      focalPointY?: number | null;
      mediaAsset: {
        id: string;
        mediaType: string;
        sourceReference: string;
        width?: number | null;
        height?: number | null;
        aspectRatio?: string | null;
        fileType: string;
      };
    }>;
  }>;
}, locale: Locale) {
  return contentItem.variants?.find(
    (v) => v.locale === locale && v.lifecycleState === 'PUBLISHED'
  );
}

// ============================================================
// Media mapping
// ============================================================

function toMediaPresentation(media: {
  role: string;
  altText?: string | null;
  caption?: string | null;
  focalPointX?: number | null;
  focalPointY?: number | null;
  mediaAsset: {
    id: string;
    mediaType: string;
    sourceReference: string;
    width?: number | null;
    height?: number | null;
    aspectRatio?: string | null;
    fileType: string;
  };
}): MediaPresentation {
  const asset = media.mediaAsset;
  return {
    id: asset.id,
    mediaType: asset.mediaType.toLowerCase() as 'image' | 'video',
    src: asset.sourceReference,
    width: asset.width ?? 0,
    height: asset.height ?? 0,
    aspectRatio: asset.aspectRatio ?? '1/1',
    alt: media.altText ?? '',
    caption: media.caption ?? undefined,
    focalPoint: media.focalPointX != null && media.focalPointY != null
      ? { x: media.focalPointX, y: media.focalPointY }
      : undefined,
    loading: 'lazy',
  };
}

function findMediaByRole(mediaPresentations: Array<{
  role: string;
  altText?: string | null;
  caption?: string | null;
  focalPointX?: number | null;
  focalPointY?: number | null;
  mediaAsset: {
    id: string;
    mediaType: string;
    sourceReference: string;
    width?: number | null;
    height?: number | null;
    aspectRatio?: string | null;
    fileType: string;
  };
}>, role: string) {
  const media = mediaPresentations?.find((m) => m.role === role);
  return media ? toMediaPresentation(media) : undefined;
}

// ============================================================
// Summary mappers
// ============================================================

function toProductSummary(v: {
  id: string;
  name?: string | null;
  slug: string;
  tagline?: string | null;
  isFeatured: boolean;
  mediaPresentations?: Array<{
    role: string;
    altText?: string | null;
    caption?: string | null;
    focalPointX?: number | null;
    focalPointY?: number | null;
    mediaAsset: {
      id: string;
      mediaType: string;
      sourceReference: string;
      width?: number | null;
      height?: number | null;
      aspectRatio?: string | null;
      fileType: string;
    };
  }>;
}): ProductSummary {
  return {
    id: v.id,
    name: v.name ?? '',
    slug: v.slug,
    tagline: v.tagline ?? undefined,
    isFeatured: v.isFeatured,
    primaryImage: findMediaByRole(v.mediaPresentations ?? [], 'PRIMARY'),
  };
}

function toContentSummary(v: { id: string; name?: string | null; slug: string }): ContentSummary {
  return { id: v.id, name: v.name ?? '', slug: v.slug };
}

function toCollectionSummary(v: {
  id: string;
  name?: string | null;
  slug: string;
  description?: string | null;
  mediaPresentations?: Array<{
    role: string;
    altText?: string | null;
    caption?: string | null;
    focalPointX?: number | null;
    focalPointY?: number | null;
    mediaAsset: {
      id: string;
      mediaType: string;
      sourceReference: string;
      width?: number | null;
      height?: number | null;
      aspectRatio?: string | null;
      fileType: string;
    };
  }>;
}): CollectionSummary {
  return {
    id: v.id,
    name: v.name ?? '',
    slug: v.slug,
    description: v.description ?? undefined,
    coverImage: findMediaByRole(v.mediaPresentations ?? [], 'PRIMARY') ?? findMediaByRole(v.mediaPresentations ?? [], 'HERO'),
  };
}

function toApplicationSummary(v: {
  id: string;
  name?: string | null;
  slug: string;
  description?: string | null;
  mediaPresentations?: Array<{
    role: string;
    altText?: string | null;
    caption?: string | null;
    focalPointX?: number | null;
    focalPointY?: number | null;
    mediaAsset: {
      id: string;
      mediaType: string;
      sourceReference: string;
      width?: number | null;
      height?: number | null;
      aspectRatio?: string | null;
      fileType: string;
    };
  }>;
}): ApplicationSummary {
  return {
    id: v.id,
    name: v.name ?? '',
    slug: v.slug,
    description: v.description ?? undefined,
    coverImage: findMediaByRole(v.mediaPresentations ?? [], 'PRIMARY') ?? findMediaByRole(v.mediaPresentations ?? [], 'HERO'),
  };
}

function toProjectSummary(v: {
  id: string;
  name?: string | null;
  slug: string;
  description?: string | null;
  mediaPresentations?: Array<{
    role: string;
    altText?: string | null;
    caption?: string | null;
    focalPointX?: number | null;
    focalPointY?: number | null;
    mediaAsset: {
      id: string;
      mediaType: string;
      sourceReference: string;
      width?: number | null;
      height?: number | null;
      aspectRatio?: string | null;
      fileType: string;
    };
  }>;
}): ProjectSummary {
  return {
    id: v.id,
    name: v.name ?? '',
    slug: v.slug,
    description: v.description ?? undefined,
    heroImage: findMediaByRole(v.mediaPresentations ?? [], 'HERO') ?? findMediaByRole(v.mediaPresentations ?? [], 'PRIMARY'),
  };
}

function toJournalSummary(v: {
  id: string;
  name?: string | null;
  slug: string;
  description?: string | null;
  createdAt: Date;
  mediaPresentations?: Array<{
    role: string;
    altText?: string | null;
    caption?: string | null;
    focalPointX?: number | null;
    focalPointY?: number | null;
    mediaAsset: {
      id: string;
      mediaType: string;
      sourceReference: string;
      width?: number | null;
      height?: number | null;
      aspectRatio?: string | null;
      fileType: string;
    };
  }>;
  journalArticle?: {
    publicationDate: Date;
    authorName?: string | null;
  } | null;
}): JournalSummary {
  return {
    id: v.id,
    title: v.name ?? '',
    slug: v.slug,
    summary: v.description ?? '',
    coverImage: findMediaByRole(v.mediaPresentations ?? [], 'PRIMARY') ?? findMediaByRole(v.mediaPresentations ?? [], 'HERO'),
    publicationDate: v.journalArticle?.publicationDate?.toISOString() ?? v.createdAt.toISOString(),
    author: v.journalArticle?.authorName ?? undefined,
  };
}

// ============================================================
// SEO builder
// ============================================================

function buildSEO(
  variant: {
    name?: string | null;
    slug: string;
    description?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    seoCanonical?: string | null;
    seoRobots?: string | null;
  },
  locale: Locale,
  path: string,
  alternates?: Array<{ locale: Locale; slug: string }>
): SEOData {
  return buildSEOData({
    locale,
    path,
    name: variant.name ?? '',
    siteName: SITE_NAME,
    description: variant.description ?? undefined,
    seoTitle: variant.seoTitle,
    seoDescription: variant.seoDescription,
    seoCanonical: variant.seoCanonical,
    seoRobots: variant.seoRobots,
    alternates,
  });
}

// ============================================================
// Content Service
// ============================================================

class ContentService {
  async getProductList(locale: Locale) {
    const result = await contentRepository.listProducts(locale, { page: 1, pageSize: 20 });
    return {
      data: result.items.map((v) => {
        const cv = findPublishedVariant(v.contentItem, locale);
        if (!cv) return null;
        return toProductSummary(cv);
      }).filter(Boolean),
      meta: result.meta,
    };
  }

  async getProductDetail(slug: string, locale: Locale) {
    const variant = await contentRepository.findPublishedBySlug(slug, locale);
    if (!variant || variant.contentItem.type !== 'PRODUCT') {
      throw new NotFoundError();
    }

    const cv = findPublishedVariant(variant.contentItem, locale);
    if (!cv) throw new NotFoundError();

    const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
    const altVariant = await contentRepository.findByContentItemId(variant.contentItemId, altLocale);
    const alternates = altVariant
      ? [{ locale, slug: variant.slug }, { locale: altLocale, slug: altVariant.slug }]
      : [{ locale, slug: variant.slug }];

    const [collections, applications, relatedProducts, journalArticles] = await Promise.all([
      contentRepository.getProductCollections(variant.contentItemId, locale),
      contentRepository.getProductApplications(variant.contentItemId, locale),
      contentRepository.getRelatedProducts(variant.contentItemId, locale),
      contentRepository.getJournalArticlesForProduct(variant.contentItemId, locale),
    ]);

    // Get projects that use this product
    const projectRefs = await contentRepository.getProductProjects(variant.contentItemId, locale);

    const gallery = (variant.mediaPresentations ?? [])
      .filter((m) => m.role === 'GALLERY')
      .map(toMediaPresentation);

    return {
      id: variant.contentItemId,
      name: cv.name ?? '',
      slug: variant.slug,
      tagline: cv.tagline ?? undefined,
      description: cv.description ?? '',
      primaryImage: findMediaByRole(variant.mediaPresentations ?? [], 'PRIMARY'),
      gallery,
      collections: collections.map((c) => {
        const cvar = findPublishedVariant(c.contentItem, locale);
        return cvar ? { id: c.contentItemId, name: cvar.name ?? '', slug: cvar.slug } : null;
      }).filter(Boolean),
      applications: applications.map((a) => {
        const avar = findPublishedVariant(a.contentItem, locale);
        return avar ? { id: a.contentItemId, name: avar.name ?? '', slug: avar.slug } : null;
      }).filter(Boolean),
      projects: projectRefs.map((p) => {
        const pvar = findPublishedVariant(p.contentItem, locale);
        return pvar ? { id: p.contentItemId, name: pvar.name ?? '', slug: pvar.slug } : null;
      }).filter(Boolean),
      relatedProducts: relatedProducts.map((rp) => {
        const rpv = findPublishedVariant(rp.contentItem, locale);
        return rpv ? toProductSummary(rpv) : null;
      }).filter(Boolean),
      journalArticles: journalArticles.map((ja) => {
        const jv = findPublishedVariant(ja.contentItem, locale);
        return jv ? { id: ja.contentItemId, name: jv.name ?? '', slug: jv.slug } : null;
      }).filter(Boolean),
      seo: buildSEO(cv, locale, `/${locale}/products/${variant.slug}`, alternates),
      quoteContextIdentifier: `product:${variant.contentItemId}`,
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    };
  }

  async getCollectionList(locale: Locale) {
    const result = await contentRepository.listCollections(locale, { page: 1, pageSize: 20 });
    return {
      data: result.items.map((v) => {
        const cv = findPublishedVariant(v.contentItem, locale);
        if (!cv) return null;
        return toCollectionSummary(cv);
      }).filter(Boolean),
      meta: result.meta,
    };
  }

  async getCollectionDetail(slug: string, locale: Locale) {
    const variant = await contentRepository.findPublishedBySlug(slug, locale);
    if (!variant || variant.contentItem.type !== 'COLLECTION') {
      throw new NotFoundError();
    }

    const cv = findPublishedVariant(variant.contentItem, locale);
    if (!cv) throw new NotFoundError();

    const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
    const altVariant = await contentRepository.findByContentItemId(variant.contentItemId, altLocale);
    const alternates = altVariant
      ? [{ locale, slug: variant.slug }, { locale: altLocale, slug: altVariant.slug }]
      : [{ locale, slug: variant.slug }];

    const [products, applications] = await Promise.all([
      contentRepository.getCollectionProducts(variant.contentItemId, locale),
      contentRepository.getCollectionApplications(variant.contentItemId, locale),
    ]);

    return {
      id: variant.contentItemId,
      name: cv.name ?? '',
      slug: variant.slug,
      description: cv.description ?? '',
      coverImage: findMediaByRole(variant.mediaPresentations ?? [], 'PRIMARY'),
      products: products.map((p) => {
        const pv = findPublishedVariant(p.contentItem, locale);
        return pv ? toProductSummary(pv) : null;
      }).filter(Boolean),
      applications: applications.map((a) => {
        const av = findPublishedVariant(a.contentItem, locale);
        return av ? toContentSummary(av) : null;
      }).filter(Boolean),
      seo: buildSEO(cv, locale, `/${locale}/collections/${variant.slug}`, alternates),
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    };
  }

  async getApplicationList(locale: Locale) {
    const result = await contentRepository.listApplications(locale, { page: 1, pageSize: 20 });
    return {
      data: result.items.map((v) => {
        const cv = findPublishedVariant(v.contentItem, locale);
        if (!cv) return null;
        return toApplicationSummary(cv);
      }).filter(Boolean),
      meta: result.meta,
    };
  }

  async getApplicationDetail(slug: string, locale: Locale) {
    const variant = await contentRepository.findPublishedBySlug(slug, locale);
    if (!variant || variant.contentItem.type !== 'APPLICATION') {
      throw new NotFoundError();
    }

    const cv = findPublishedVariant(variant.contentItem, locale);
    if (!cv) throw new NotFoundError();

    const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
    const altVariant = await contentRepository.findByContentItemId(variant.contentItemId, altLocale);
    const alternates = altVariant
      ? [{ locale, slug: variant.slug }, { locale: altLocale, slug: altVariant.slug }]
      : [{ locale, slug: variant.slug }];

    const [products, projects] = await Promise.all([
      contentRepository.getApplicationProducts(variant.contentItemId, locale),
      contentRepository.getApplicationProjects(variant.contentItemId, locale),
    ]);

    // Journal refs for this application
    const journalRefs = await contentRepository.getApplicationJournalRefs(variant.contentItemId, locale);

    return {
      id: variant.contentItemId,
      name: cv.name ?? '',
      slug: variant.slug,
      description: cv.description ?? '',
      coverImage: findMediaByRole(variant.mediaPresentations ?? [], 'PRIMARY'),
      products: products.map((p) => {
        const pv = findPublishedVariant(p.contentItem, locale);
        return pv ? toProductSummary(pv) : null;
      }).filter(Boolean),
      projects: projects.map((p) => {
        const pvar = findPublishedVariant(p.contentItem, locale);
        return pvar ? { id: p.contentItemId, name: pvar.name ?? '', slug: pvar.slug } : null;
      }).filter(Boolean),
      journalArticles: journalRefs.map((ja) => {
        const jv = findPublishedVariant(ja.contentItem, locale);
        return jv ? { id: ja.contentItemId, name: jv.name ?? '', slug: jv.slug } : null;
      }).filter(Boolean),
      seo: buildSEO(cv, locale, `/${locale}/applications/${variant.slug}`, alternates),
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    };
  }

  async getProjectList(locale: Locale) {
    const result = await contentRepository.listProjects(locale, { page: 1, pageSize: 20 });
    return {
      data: result.items.map((v) => {
        const cv = findPublishedVariant(v.contentItem, locale);
        if (!cv) return null;
        return toProjectSummary(cv);
      }).filter(Boolean),
      meta: result.meta,
    };
  }

  async getProjectDetail(slug: string, locale: Locale) {
    const variant = await contentRepository.findPublishedBySlug(slug, locale);
    if (!variant || variant.contentItem.type !== 'PROJECT') {
      throw new NotFoundError();
    }

    const cv = findPublishedVariant(variant.contentItem, locale);
    if (!cv) throw new NotFoundError();

    const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
    const altVariant = await contentRepository.findByContentItemId(variant.contentItemId, altLocale);
    const alternates = altVariant
      ? [{ locale, slug: variant.slug }, { locale: altLocale, slug: altVariant.slug }]
      : [{ locale, slug: variant.slug }];

    const project = variant.contentItem.project;

    const [products, applications] = await Promise.all([
      contentRepository.getProjectProducts(variant.contentItemId, locale),
      contentRepository.getProjectApplications(variant.contentItemId, locale),
    ]);

    const gallery = (variant.mediaPresentations ?? [])
      .filter((m) => m.role === 'GALLERY')
      .map(toMediaPresentation);

    return {
      id: variant.contentItemId,
      name: cv.name ?? '',
      slug: variant.slug,
      description: cv.description ?? '',
      location: project?.location ?? undefined,
      projectType: project?.projectType ?? undefined,
      heroImage: findMediaByRole(variant.mediaPresentations ?? [], 'HERO') ?? findMediaByRole(variant.mediaPresentations ?? [], 'PRIMARY'),
      gallery,
      products: products.map((p) => {
        const pv = findPublishedVariant(p.contentItem, locale);
        return pv ? toProductSummary(pv) : null;
      }).filter(Boolean),
      applications: applications.map((a) => {
        const av = findPublishedVariant(a.contentItem, locale);
        return av ? { id: a.contentItemId, name: av.name ?? '', slug: av.slug } : null;
      }).filter(Boolean),
      seo: buildSEO(cv, locale, `/${locale}/projects/${variant.slug}`, alternates),
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    };
  }

  async getJournalList(locale: Locale) {
    const result = await contentRepository.listJournalArticles(locale, { page: 1, pageSize: 20 });
    return {
      data: result.items.map((v) => {
        const cv = findPublishedVariant(v.contentItem, locale);
        if (!cv) return null;
        return toJournalSummary({ ...cv, createdAt: v.createdAt, journalArticle: v.contentItem.journalArticle });
      }).filter(Boolean),
      meta: result.meta,
    };
  }

  async getJournalDetail(slug: string, locale: Locale) {
    const variant = await contentRepository.findPublishedBySlug(slug, locale);
    if (!variant || variant.contentItem.type !== 'JOURNAL_ARTICLE') {
      throw new NotFoundError();
    }

    const cv = findPublishedVariant(variant.contentItem, locale);
    if (!cv) throw new NotFoundError();

    const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';
    const altVariant = await contentRepository.findByContentItemId(variant.contentItemId, altLocale);
    const alternates = altVariant
      ? [{ locale, slug: variant.slug }, { locale: altLocale, slug: altVariant.slug }]
      : [{ locale, slug: variant.slug }];

    const { products, applications, projects } = await contentRepository.getJournalReferences(variant.contentItemId, locale);

    const journalArticle = variant.contentItem.journalArticle;
    const coverImage = findMediaByRole(variant.mediaPresentations ?? [], 'PRIMARY') ?? findMediaByRole(variant.mediaPresentations ?? [], 'HERO');

    const relatedArticleRefs = await contentRepository.getRelatedJournalArticles(variant.contentItemId, locale);

    return {
      id: variant.contentItemId,
      title: cv.name ?? '',
      slug: variant.slug,
      summary: cv.description ?? '',
      body: cv.description ?? '',
      coverImage,
      publicationDate: journalArticle?.publicationDate?.toISOString() ?? variant.createdAt.toISOString(),
      author: journalArticle?.authorName ?? undefined,
      relatedProducts: products.map((p) => {
        const pv = findPublishedVariant(p.contentItem, locale);
        return pv ? toProductSummary(pv) : null;
      }).filter(Boolean),
      relatedApplications: applications.map((a) => {
        const av = findPublishedVariant(a.contentItem, locale);
        return av ? { id: a.contentItemId, name: av.name ?? '', slug: av.slug } : null;
      }).filter(Boolean),
      relatedProjects: projects.map((p) => {
        const pvar = findPublishedVariant(p.contentItem, locale);
        return pvar ? { id: p.contentItemId, name: pvar.name ?? '', slug: pvar.slug } : null;
      }).filter(Boolean),
      relatedArticles: relatedArticleRefs.map((ja) => {
        const jv = findPublishedVariant(ja.contentItem, locale);
        return jv ? { id: ja.contentItemId, name: jv.name ?? '', slug: jv.slug, summary: jv.description ?? '' } : null;
      }).filter(Boolean),
      seo: buildSEO(cv, locale, `/${locale}/journal/${variant.slug}`, alternates),
      createdAt: variant.createdAt.toISOString(),
      updatedAt: variant.updatedAt.toISOString(),
    };
  }

  async getCompanyContent(kind: string, locale: Locale) {
    const variant = await contentRepository.findCompanyContent(kind, locale);
    if (!variant) throw new NotFoundError();

    const cv = findPublishedVariant(variant.contentItem, locale);
    if (!cv) throw new NotFoundError();

    return {
      id: variant.contentItemId,
      name: cv.name ?? '',
      slug: variant.slug,
      description: cv.description ?? '',
      coverImage: findMediaByRole(variant.mediaPresentations ?? [], 'PRIMARY'),
    };
  }

  async getHomepage(locale: Locale): Promise<HomepageContent> {
    const [featuredProducts, featuredCollections, featuredApplications, featuredProjects, featuredJournal, quarry, factory, projectsVisible] = await Promise.all([
      contentRepository.getFeaturedProducts(locale),
      contentRepository.getFeaturedCollections(locale),
      contentRepository.getFeaturedApplications(locale),
      contentRepository.getFeaturedProjects(locale),
      contentRepository.getFeaturedJournal(locale),
      contentRepository.findCompanyContent('QUARRY', locale),
      contentRepository.findCompanyContent('FACTORY', locale),
      contentRepository.hasPublishedProjects(locale),
    ]);

    const sections: HomepageSection[] = [];
    const sectionOrder: string[] = ['hero'];

    if (featuredProducts.length > 0) {
      sections.push({
        type: 'featured_products',
        products: featuredProducts.map((v) => toProductSummary(v)),
      });
      sectionOrder.push('featured_products');
    }

    if (featuredCollections.length > 0) {
      sections.push({
        type: 'featured_collections',
        collections: featuredCollections.map((v) => toCollectionSummary(v)),
      });
      sectionOrder.push('featured_collections');
    }

    if (featuredApplications.length > 0) {
      sections.push({
        type: 'featured_applications',
        applications: featuredApplications.map((v) => toApplicationSummary(v)),
      });
      sectionOrder.push('featured_applications');
    }

    if (quarry || factory) {
      const quarryData = quarry
        ? (() => {
            const qv = findPublishedVariant(quarry.contentItem, locale);
            return qv ? { name: qv.name ?? '', slug: qv.slug, coverImage: findMediaByRole(quarry.mediaPresentations ?? [], 'PRIMARY') } : undefined;
          })()
        : undefined;
      const factoryData = factory
        ? (() => {
            const fv = findPublishedVariant(factory.contentItem, locale);
            return fv ? { name: fv.name ?? '', slug: fv.slug, coverImage: findMediaByRole(factory.mediaPresentations ?? [], 'PRIMARY') } : undefined;
          })()
        : undefined;
      if (quarryData || factoryData) {
        sections.push({ type: 'quarry_factory', quarry: quarryData, factory: factoryData });
        sectionOrder.push('quarry_factory');
      }
    }

    if (projectsVisible && featuredProjects.length > 0) {
      sections.push({
        type: 'featured_projects',
        projects: featuredProjects.map((v) => toProjectSummary(v)),
      });
      sectionOrder.push('featured_projects');
    }

    if (featuredJournal.length > 0) {
      sections.push({
        type: 'featured_journal',
        articles: featuredJournal.map((v) => toJournalSummary({ ...v, journalArticle: v.contentItem.journalArticle })),
      });
      sectionOrder.push('featured_journal');
    }

    sections.push({
      type: 'final_cta',
      heading: locale === 'tr' ? 'Projeniz İçin Teklif Alın' : 'Get a Quote for Your Project',
      message: locale === 'tr' ? 'Uzman ekibimiz size yardımcı olmaya hazır.' : 'Our expert team is ready to help you.',
      primaryCTA: { label: locale === 'tr' ? 'Teklif Talebi' : 'Request Quote', href: `/${locale}/quote` },
      secondaryCTA: { label: locale === 'tr' ? 'İletişim' : 'Contact', href: `/${locale}/contact` },
    });
    sectionOrder.push('final_cta');

    const heroHeading = locale === 'tr' ? 'Premium Türk Mermeri' : 'Premium Turkish Marble';
    const hero = {
      heading: heroHeading,
      subheading: locale === 'tr' ? 'Doğanın Zarafeti, Ustalığın Gücü' : 'Elegance of Nature, Power of Craftsmanship',
      // Demo hero poster — served as static fallback image until a real
      // homepage video (and its DB-driven media) is available. HeroScrollStage
      // renders this via HeroPoster; no video means poster-only mode.
      fallbackImage: {
        id: 'demo-hero-poster',
        mediaType: 'image',
        src: '/demo/images/demo-hero-poster.svg',
        width: 1920,
        height: 1080,
        aspectRatio: '16/9',
        alt: heroHeading,
        loading: 'eager',
      } satisfies MediaPresentation,
      primaryCTA: { label: locale === 'tr' ? 'Mermerleri Keşfet' : 'Explore Marbles', href: `/${locale}/products` },
      secondaryCTA: { label: locale === 'tr' ? 'Teklif Talebi' : 'Request Quote', href: `/${locale}/quote` },
    };

    const canonical = buildCanonical(locale, `/${locale}`);
    const seo: SEOData = {
      title: `${SITE_NAME} — ${locale === 'tr' ? 'Premium Türk Mermeri' : 'Premium Turkish Marble'}`,
      metaDescription: locale === 'tr'
        ? 'Doğanın zarafeti ve ustalığın gücünü birleştiren premium Türk mermeri koleksiyonumuzu keşfedin.'
        : 'Discover our premium Turkish marble collection, combining the elegance of nature with the power of craftsmanship.',
      canonical,
      robots: 'index',
      hreflang: [
        { lang: 'tr', href: buildCanonical('tr', '/tr') },
        { lang: 'en', href: buildCanonical('en', '/en') },
        { lang: 'x-default', href: buildCanonical('tr', '/tr') },
      ],
    };

    return { hero, sections, sectionOrder, seo };
  }

  async getNavigation(locale: Locale) {
    const projectsVisible = await contentRepository.hasPublishedProjects(locale);
    const altLocale: Locale = locale === 'tr' ? 'en' : 'tr';

    const primary = [
      { label: locale === 'tr' ? 'Mermerler' : 'Marbles', href: `/${locale}/products`, visible: true },
      { label: locale === 'tr' ? 'Koleksiyonlar' : 'Collections', href: `/${locale}/collections`, visible: true },
      { label: locale === 'tr' ? 'Uygulamalar' : 'Applications', href: `/${locale}/applications`, visible: true },
      { label: locale === 'tr' ? 'Projeler' : 'Projects', href: `/${locale}/projects`, visible: projectsVisible },
      { label: locale === 'tr' ? 'Dergi' : 'Journal', href: `/${locale}/journal`, visible: true },
      { label: locale === 'tr' ? 'Hakkında' : 'About', href: `/${locale}/about`, visible: true },
    ];

    const utility = [
      { label: locale === 'tr' ? 'EN' : 'TR', href: `/${altLocale}`, visible: true, type: 'language_switch' as const },
      { label: locale === 'tr' ? 'Teklif Talebi' : 'Request Quote', href: `/${locale}/quote`, visible: true, type: 'cta' as const },
      { label: locale === 'tr' ? 'İletişim' : 'Contact', href: `/${locale}/contact`, visible: true, type: 'link' as const },
    ];

    return { primary, utility, projectsVisible };
  }

  async getFooter(locale: Locale) {
    const projectsVisible = await contentRepository.hasPublishedProjects(locale);

    const [aboutExists, quarryExists, factoryExists] = await Promise.all([
      contentRepository.findCompanyContent('ABOUT', locale),
      contentRepository.findCompanyContent('QUARRY', locale),
      contentRepository.findCompanyContent('FACTORY', locale),
    ]);

    const company = [
      { label: locale === 'tr' ? 'Hakkında' : 'About', href: `/${locale}/about`, visible: !!aboutExists },
      { label: locale === 'tr' ? 'Ocak' : 'Quarry', href: `/${locale}/quarry`, visible: !!quarryExists },
      { label: locale === 'tr' ? 'Fabrika' : 'Factory', href: `/${locale}/factory`, visible: !!factoryExists },
      { label: locale === 'tr' ? 'İletişim' : 'Contact', href: `/${locale}/contact`, visible: true },
    ];

    const catalogue = [
      { label: locale === 'tr' ? 'Mermerler' : 'Marbles', href: `/${locale}/products`, visible: true },
      { label: locale === 'tr' ? 'Koleksiyonlar' : 'Collections', href: `/${locale}/collections`, visible: true },
      { label: locale === 'tr' ? 'Uygulamalar' : 'Applications', href: `/${locale}/applications`, visible: true },
      { label: locale === 'tr' ? 'Projeler' : 'Projects', href: `/${locale}/projects`, visible: projectsVisible },
      { label: locale === 'tr' ? 'Dergi' : 'Journal', href: `/${locale}/journal`, visible: true },
    ];

    const conversion = [
      { label: locale === 'tr' ? 'Teklif Talebi' : 'Request Quote', href: `/${locale}/quote`, visible: true },
    ];

    const legal: Array<{ label: string; href: string; visible: boolean }> = [];

    const language = [
      { label: 'Türkçe', href: '/tr', active: locale === 'tr', available: true },
      { label: 'English', href: '/en', active: locale === 'en', available: true },
    ];

    const copyright = `${new Date().getFullYear()} ${SITE_NAME}. ${locale === 'tr' ? 'Tüm hakları saklıdır.' : 'All rights reserved.'}`;

    return { company, catalogue, conversion, legal, language, copyright };
  }

  async createQuoteRequest(data: {
    contactName: string;
    contactEmail: string;
    contactPhone?: string;
    company?: string;
    message: string;
    locale: string;
    context?: {
      contextKind: 'PRODUCT' | 'PROJECT' | 'APPLICATION';
      productId?: string;
      projectId?: string;
      applicationId?: string;
    };
  }) {
    if (data.context) {
      const refs = [data.context.productId, data.context.projectId, data.context.applicationId].filter(Boolean);
      if (refs.length !== 1) {
        throw new NotFoundError('Quote request context must reference exactly one entity.');
      }
    }

    const result = await contentRepository.createQuoteRequest(data);
    return {
      id: result.id,
      submittedAt: result.submittedAt.toISOString(),
    };
  }

  async isProjectsVisible(locale: Locale): Promise<boolean> {
    return contentRepository.hasPublishedProjects(locale);
  }
}

export const contentService = new ContentService();
