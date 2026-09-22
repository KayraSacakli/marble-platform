import { BaseRepository } from './base';
import type { Locale } from '@/types/locale';
import type { PaginationInput } from '@/lib/api/validation';
import type { ContentType, ContentAggregateState, VariantLifecycle } from '@prisma/client';

export class ContentRepository extends BaseRepository {
  private publishedClause(locale: Locale) {
    return {
      contentItem: { aggregateState: 'ACTIVE' as ContentAggregateState },
      locale,
      lifecycleState: 'PUBLISHED' as VariantLifecycle,
    };
  }

  /**
   * Find a published content variant by slug and locale with full includes.
   */
  async findPublishedBySlug(slug: string, locale: Locale) {
    return this.db.contentVariant.findFirst({
      where: {
        slug,
        ...this.publishedClause(locale),
      },
      include: {
        contentItem: {
          include: {
            variants: true,
            product: true,
            collection: true,
            application: true,
            project: true,
            journalArticle: true,
            companyContent: true,
          },
        },
        mediaPresentations: {
          include: { mediaAsset: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * Find a published content variant by contentItemId and locale.
   */
  async findByContentItemId(contentItemId: string, locale: Locale) {
    return this.db.contentVariant.findFirst({
      where: {
        contentItemId,
        ...this.publishedClause(locale),
      },
      include: {
        contentItem: {
          include: {
            variants: true,
            product: true,
            collection: true,
            application: true,
            project: true,
            journalArticle: true,
            companyContent: true,
          },
        },
        mediaPresentations: {
          include: { mediaAsset: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  /**
   * List published content variants by type and locale with pagination.
   */
  async listPublished(options: {
    contentType?: ContentType;
    locale: Locale;
    pagination: PaginationInput;
    orderBy?: Record<string, string>;
  }) {
    const { contentType, locale, pagination, orderBy } = options;
    const { page, pageSize, skip } = this.normalizePagination(pagination);

    const where = {
      ...this.publishedClause(locale),
      ...(contentType ? { contentItem: { type: contentType } } : {}),
    };

    const [items, total] = await Promise.all([
      this.db.contentVariant.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: orderBy ?? { name: 'asc' },
        include: {
          contentItem: {
            include: {
              variants: true,
              product: true,
              collection: true,
              journalArticle: true,
            },
          },
          mediaPresentations: {
            include: { mediaAsset: true },
            orderBy: { displayOrder: 'asc' },
          },
        },
      }),
      this.db.contentVariant.count({ where }),
    ]);

    return {
      items,
      meta: this.buildMeta(total, { page, pageSize }),
    };
  }

  async listProducts(locale: Locale, pagination: PaginationInput) {
    return this.listPublished({ contentType: 'PRODUCT', locale, pagination, orderBy: { name: 'asc' } });
  }

  async listCollections(locale: Locale, pagination: PaginationInput) {
    return this.listPublished({ contentType: 'COLLECTION', locale, pagination, orderBy: { name: 'asc' } });
  }

  async listApplications(locale: Locale, pagination: PaginationInput) {
    return this.listPublished({ contentType: 'APPLICATION', locale, pagination, orderBy: { name: 'asc' } });
  }

  async listProjects(locale: Locale, pagination: PaginationInput) {
    return this.listPublished({ contentType: 'PROJECT', locale, pagination, orderBy: { name: 'asc' } });
  }

  async listJournalArticles(locale: Locale, pagination: PaginationInput) {
    return this.listPublished({ contentType: 'JOURNAL_ARTICLE', locale, pagination, orderBy: { name: 'asc', createdAt: 'desc' } });
  }

  async countPublished(contentType: ContentType, locale: Locale): Promise<number> {
    return this.db.contentVariant.count({
      where: { ...this.publishedClause(locale), contentItem: { type: contentType } },
    });
  }

  async hasPublishedProjects(locale: Locale): Promise<boolean> {
    const count = await this.countPublished('PROJECT', locale);
    return count > 0;
  }

  async findCompanyContent(kind: string, locale: Locale) {
    return this.db.contentVariant.findFirst({
      where: {
        ...this.publishedClause(locale),
        contentItem: {
          type: 'COMPANY_CONTENT',
          companyContent: { kind: kind as never },
        },
      },
      include: {
        contentItem: {
          include: { variants: true, companyContent: true },
        },
        mediaPresentations: {
          include: { mediaAsset: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  // ============================================================
  // Relationship queries
  // ============================================================

  /**
   * Get published product collections for a product contentItemId.
   */
  async getProductCollections(contentItemId: string, locale: Locale) {
    const where = {
      collectionId: contentItemId,
      collection: {
        contentItem: { aggregateState: 'ACTIVE' as ContentAggregateState },
      },
    };
    const junctions = await this.db.productCollection.findMany({
      where,
      include: {
        collection: {
          include: {
            contentItem: { include: { variants: true } },
            products: {
              include: {
                product: {
                  include: { contentItem: { include: { variants: true } } },
                },
              },
            },
          },
        },
      },
    });
    return junctions
      .map((j) => j.collection)
      .filter((c) => {
        const variant = c.contentItem.variants?.find((v) => v.locale === locale);
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get published product applications for a product contentItemId.
   */
  async getProductApplications(contentItemId: string, locale: Locale) {
    const junctions = await this.db.productApplication.findMany({
      where: { productId: contentItemId },
      include: {
        application: {
          include: {
            contentItem: { include: { variants: true } },
          },
        },
      },
    });
    return junctions
      .map((j) => j.application)
      .filter((a) => {
        const variant = a.contentItem.variants?.find((v) => v.locale === locale);
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get related published products for a product contentItemId.
   */
  async getRelatedProducts(contentItemId: string, _locale: Locale) {
    const junctions = await this.db.relatedProduct.findMany({
      where: { sourceProductId: contentItemId },
      include: {
        targetProduct: {
          include: {
            contentItem: {
              include: {
                variants: true,
              },
            },
          },
        },
      },
    });
    return junctions
      .map((j) => j.targetProduct)
      .filter((p) => {
        const variant = p.contentItem.variants?.[0];
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get published products in a collection.
   */
  async getCollectionProducts(collectionContentItemId: string, locale: Locale) {
    const junctions = await this.db.productCollection.findMany({
      where: { collectionId: collectionContentItemId },
      include: {
        product: {
          include: {
            contentItem: {
              include: {
                variants: {
                  where: { locale, lifecycleState: 'PUBLISHED' },
                  include: {
                    mediaPresentations: {
                      include: { mediaAsset: true },
                      where: { role: 'PRIMARY' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return junctions
      .map((j) => j.product)
      .filter((p) => {
        const variant = p.contentItem.variants?.[0];
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get published applications for a collection (via products).
   */
  async getCollectionApplications(collectionContentItemId: string, locale: Locale) {
    const products = await this.getCollectionProducts(collectionContentItemId, locale);
    const appIds = new Set<string>();
    for (const product of products) {
      const apps = await this.getProductApplications(product.contentItemId, locale);
      for (const app of apps) {
        appIds.add(app.contentItemId);
      }
    }
    const applications = [];
    for (const appId of appIds) {
      const variant = await this.findByContentItemId(appId, locale);
      if (variant) applications.push(variant);
    }
    return applications;
  }

  /**
   * Get published products for an application.
   */
  async getApplicationProducts(applicationContentItemId: string, locale: Locale) {
    const junctions = await this.db.productApplication.findMany({
      where: { applicationId: applicationContentItemId },
      include: {
        product: {
          include: {
            contentItem: {
              include: {
                variants: {
                  where: { locale, lifecycleState: 'PUBLISHED' },
                  include: {
                    mediaPresentations: {
                      include: { mediaAsset: true },
                      where: { role: 'PRIMARY' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return junctions
      .map((j) => j.product)
      .filter((p) => {
        const variant = p.contentItem.variants?.[0];
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get projects for an application.
   */
  async getApplicationProjects(applicationContentItemId: string, locale: Locale) {
    const junctions = await this.db.projectApplication.findMany({
      where: { applicationId: applicationContentItemId },
      include: {
        project: {
          include: {
            contentItem: { include: { variants: true } },
          },
        },
      },
    });
    return junctions
      .map((j) => j.project)
      .filter((p) => {
        const variant = p.contentItem.variants?.find((v) => v.locale === locale);
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get journal articles referencing a product.
   */
  async getJournalArticlesForProduct(productContentItemId: string, locale: Locale) {
    const refs = await this.db.journalContentReference.findMany({
      where: { productProductId: productContentItemId },
      include: {
        journalArticle: {
          include: { contentItem: { include: { variants: true } } },
        },
      },
    });
    return refs
      .map((r) => r.journalArticle)
      .filter((ja) => {
        const variant = ja.contentItem.variants?.find((v) => v.locale === locale);
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get products for a project.
   */
  async getProjectProducts(projectContentItemId: string, locale: Locale) {
    const junctions = await this.db.projectProduct.findMany({
      where: { projectId: projectContentItemId },
      include: {
        product: {
          include: {
            contentItem: {
              include: {
                variants: {
                  where: { locale, lifecycleState: 'PUBLISHED' },
                  include: {
                    mediaPresentations: {
                      include: { mediaAsset: true },
                      where: { role: 'PRIMARY' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return junctions
      .map((j) => j.product)
      .filter((p) => {
        const variant = p.contentItem.variants?.[0];
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get applications for a project.
   */
  async getProjectApplications(projectContentItemId: string, locale: Locale) {
    const junctions = await this.db.projectApplication.findMany({
      where: { projectId: projectContentItemId },
      include: {
        application: {
          include: { contentItem: { include: { variants: true } } },
        },
      },
    });
    return junctions
      .map((j) => j.application)
      .filter((a) => {
        const variant = a.contentItem.variants?.find((v) => v.locale === locale);
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get related content references for a journal article.
   */
  async getJournalReferences(journalContentItemId: string, _locale: Locale) {
    const refs = await this.db.journalContentReference.findMany({
      where: { journalArticleId: journalContentItemId },
      include: {
        product: { include: { contentItem: { include: { variants: true } } } },
        application: { include: { contentItem: { include: { variants: true } } } },
        project: { include: { contentItem: { include: { variants: true } } } },
      },
    });

    const products = refs.filter((r) => r.product).map((r) => r.product!);
    const applications = refs.filter((r) => r.application).map((r) => r.application!);
    const projects = refs.filter((r) => r.project).map((r) => r.project!);

    return { products, applications, projects };
  }

  /**
   * Get journal articles referencing a company content.
   */
  async getCompanyJournalRefs(companyContentItemId: string, locale: Locale) {
    const refs = await this.db.companyContentReference.findMany({
      where: { companyContentId: companyContentItemId },
      include: {
        journalArticle: { include: { contentItem: { include: { variants: true } } } },
      },
    });
    return refs
      .map((r) => r.journalArticle)
      .filter(Boolean)
      .filter((ja) => {
        const variant = ja!.contentItem.variants?.find((v) => v.locale === locale);
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get company products referenced by a company content.
   */
  async getCompanyProducts(companyContentItemId: string, locale: Locale) {
    const refs = await this.db.companyContentReference.findMany({
      where: { companyContentId: companyContentItemId },
      include: {
        product: {
          include: {
            contentItem: {
              include: {
                variants: {
                  where: { locale, lifecycleState: 'PUBLISHED' },
                  include: {
                    mediaPresentations: {
                      include: { mediaAsset: true },
                      where: { role: 'PRIMARY' },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return refs
      .map((r) => r.product)
      .filter(Boolean)
      .filter((p) => {
        const variant = p!.contentItem.variants?.[0];
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get projects that use a given product.
   */
  async getProductProjects(productContentItemId: string, locale: Locale) {
    const junctions = await this.db.projectProduct.findMany({
      where: { productId: productContentItemId },
      include: {
        project: { include: { contentItem: { include: { variants: true } } } },
      },
    });
    return junctions
      .map((j) => j.project)
      .filter((p) => {
        const variant = p.contentItem.variants?.find((v) => v.locale === locale);
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get journal articles referencing an application.
   */
  async getApplicationJournalRefs(applicationContentItemId: string, locale: Locale) {
    const refs = await this.db.journalContentReference.findMany({
      where: { applicationId: applicationContentItemId },
      include: {
        journalArticle: { include: { contentItem: { include: { variants: true } } } },
      },
    });
    return refs
      .map((r) => r.journalArticle)
      .filter(Boolean)
      .filter((ja) => {
        const variant = ja!.contentItem.variants?.find((v) => v.locale === locale);
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get related journal articles referencing the same products/apps/projects.
   */
  async getRelatedJournalArticles(journalContentItemId: string, locale: Locale) {
    // Find what this article references
    const myRefs = await this.db.journalContentReference.findMany({
      where: { journalArticleId: journalContentItemId },
    });

    const productIds = myRefs.filter((r) => r.productProductId).map((r) => r.productProductId!);
    const appIds = myRefs.filter((r) => r.applicationId).map((r) => r.applicationId!);
    const projectIds = myRefs.filter((r) => r.projectId).map((r) => r.projectId!);

    if (productIds.length === 0 && appIds.length === 0 && projectIds.length === 0) {
      return [];
    }

    const relatedRefs = await this.db.journalContentReference.findMany({
      where: {
        journalArticleId: { not: journalContentItemId },
        OR: [
          ...(productIds.length > 0 ? [{ productProductId: { in: productIds } }] : []),
          ...(appIds.length > 0 ? [{ applicationId: { in: appIds } }] : []),
          ...(projectIds.length > 0 ? [{ projectId: { in: projectIds } }] : []),
        ],
      },
      include: {
        journalArticle: { include: { contentItem: { include: { variants: true } } } },
      },
      distinct: ['journalArticleId'],
      take: 5,
    });

    return relatedRefs
      .map((r) => r.journalArticle)
      .filter(Boolean)
      .filter((ja) => {
        const variant = ja!.contentItem.variants?.find((v) => v.locale === locale);
        return variant?.lifecycleState === 'PUBLISHED';
      });
  }

  /**
   * Get featured products for homepage.
   */
  async getFeaturedProducts(locale: Locale) {
    return this.db.contentVariant.findMany({
      where: {
        ...this.publishedClause(locale),
        contentItem: { type: 'PRODUCT' },
        isFeatured: true,
      },
      include: {
        contentItem: { include: { product: true } },
        mediaPresentations: {
          include: { mediaAsset: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { featuredOrder: 'asc' },
      take: 10,
    });
  }

  /**
   * Get featured collections for homepage.
   */
  async getFeaturedCollections(locale: Locale) {
    return this.db.contentVariant.findMany({
      where: {
        ...this.publishedClause(locale),
        contentItem: { type: 'COLLECTION' },
      },
      include: {
        contentItem: { include: { collection: true } },
        mediaPresentations: {
          include: { mediaAsset: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
      take: 10,
    });
  }

  /**
   * Get featured applications for homepage.
   */
  async getFeaturedApplications(locale: Locale) {
    return this.db.contentVariant.findMany({
      where: {
        ...this.publishedClause(locale),
        contentItem: { type: 'APPLICATION' },
      },
      include: {
        contentItem: { include: { application: true } },
        mediaPresentations: {
          include: { mediaAsset: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
      take: 10,
    });
  }

  /**
   * Get featured projects for homepage.
   */
  async getFeaturedProjects(locale: Locale) {
    return this.db.contentVariant.findMany({
      where: {
        ...this.publishedClause(locale),
        contentItem: { type: 'PROJECT' },
      },
      include: {
        contentItem: { include: { project: true } },
        mediaPresentations: {
          include: { mediaAsset: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
      take: 10,
    });
  }

  /**
   * Get featured journal articles for homepage.
   */
  async getFeaturedJournal(locale: Locale) {
    return this.db.contentVariant.findMany({
      where: {
        ...this.publishedClause(locale),
        contentItem: { type: 'JOURNAL_ARTICLE' },
      },
      include: {
        contentItem: {
          include: { journalArticle: true },
        },
        mediaPresentations: {
          include: { mediaAsset: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  }

  /**
   * Create a quote request.
   */
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
    return this.db.quoteRequest.create({
      data: {
        contactName: data.contactName,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        company: data.company,
        message: data.message,
        locale: data.locale,
        context: data.context
          ? {
              create: {
                contextKind: data.context.contextKind,
                productId: data.context.productId,
                projectId: data.context.projectId,
                applicationId: data.context.applicationId,
              },
            }
          : undefined,
      },
      include: { context: true },
    });
  }
}

export const contentRepository = new ContentRepository();
