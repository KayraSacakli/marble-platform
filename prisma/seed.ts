/**
 * Development Seed Data — marble-platform
 *
 * Idempotent seed script for populating the development PostgreSQL database
 * with realistic, neutral placeholder content. Safe to run multiple times.
 *
 * Usage:
 *   npx prisma db seed
 *   npx tsx prisma/seed.ts
 *
 * Content lifecycle: ACTIVE + PUBLISHED (publicly visible via API)
 * All content is clearly marked as development data.
 */

import { PrismaClient, type Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================================
// Types
// ============================================================

interface LocaleContent {
  name: string;
  slug: string;
  description: string;
  tagline?: string;
  seoTitle?: string;
  seoDescription?: string;
}

interface SeedProduct {
  identifier: string;
  mediaFile: string;
  mediaWidth: number;
  mediaHeight: number;
  surfaceFinish?: string;
  dimensions?: string;
  format?: string;
  origin?: string;
  tr: LocaleContent;
  en: LocaleContent;
  isFeatured: boolean;
  featuredOrder?: number;
  collections: string[];
  applications: string[];
  relatedTo: string[];
}

interface SeedCollection {
  mediaFile: string;
  tr: LocaleContent;
  en: LocaleContent;
  displayOrder: number;
}

interface SeedApplication {
  mediaFile: string;
  tr: LocaleContent;
  en: LocaleContent;
  displayOrder: number;
}

interface SeedProject {
  mediaFile: string;
  location: string;
  projectType: string;
  tr: LocaleContent;
  en: LocaleContent;
  products: string[];
  applications: string[];
}

interface SeedJournal {
  mediaFile: string;
  publicationDate: string;
  authorName: string;
  tr: LocaleContent;
  en: LocaleContent;
  referencedProducts: string[];
  referencedApplications: string[];
}

interface SeedCompanyContent {
  kind: 'ABOUT' | 'QUARRY' | 'FACTORY';
  mediaFile: string;
  tr: LocaleContent;
  en: LocaleContent;
  referencedProducts: string[];
  referencedJournalSlugs: string[];
}

// ============================================================
// Seed Data Definitions
// ============================================================

const PRODUCTS: SeedProduct[] = [
  {
    identifier: 'dev-01',
    mediaFile: '/placeholders/product-01.svg',
    mediaWidth: 800,
    mediaHeight: 600,
    surfaceFinish: 'Honed',
    dimensions: '300x600mm',
    format: 'Slab',
    origin: 'Afyon, Turkey',
    tr: {
      name: 'Geliştirme Mermeri 01',
      slug: 'gelistirme-mermeri-01',
      description: 'Geliştirme amaçlı oluşturulmuş example mermer ürünü. Bu ürün gerçek bir üretim bilgisi içermemektedir.',
      tagline: 'Klasik beyaz mermer example',
      seoTitle: 'Geliştirme Mermeri 01 — Example',
      seoDescription: 'Geliştirme amaçlı example mermer ürünü.',
    },
    en: {
      name: 'Development Marble 01',
      slug: 'development-marble-01',
      description: 'Development-purpose example marble product. This product does not contain real production information.',
      tagline: 'Classic white marble example',
      seoTitle: 'Development Marble 01 — Example',
      seoDescription: 'Development-purpose example marble product.',
    },
    isFeatured: true,
    featuredOrder: 1,
    collections: ['classic-stones'],
    applications: ['residential', 'hospitality'],
    relatedTo: ['dev-02', 'dev-03'],
  },
  {
    identifier: 'dev-02',
    mediaFile: '/placeholders/product-02.svg',
    mediaWidth: 800,
    mediaHeight: 600,
    surfaceFinish: 'Polished',
    dimensions: '600x600mm',
    format: 'Tile',
    origin: 'Bilecik, Turkey',
    tr: {
      name: 'Geliştirme Mermeri 02',
      slug: 'gelistirme-mermeri-02',
      description: 'Geliştirme amaçlı oluşturulmuş example mermer ürünü. Farklı yüzey bitişi ile.',
      tagline: 'Parlak yüzey example',
      seoTitle: 'Geliştirme Mermeri 02 — Example',
      seoDescription: 'Geliştirme amaçlı example mermer ürünü.',
    },
    en: {
      name: 'Development Marble 02',
      slug: 'development-marble-02',
      description: 'Development-purpose example marble product. With different surface finish.',
      tagline: 'Polished surface example',
      seoTitle: 'Development Marble 02 — Example',
      seoDescription: 'Development-purpose example marble product.',
    },
    isFeatured: true,
    featuredOrder: 2,
    collections: ['classic-stones'],
    applications: ['commercial'],
    relatedTo: ['dev-01', 'dev-04'],
  },
  {
    identifier: 'dev-03',
    mediaFile: '/placeholders/product-03.svg',
    mediaWidth: 800,
    mediaHeight: 600,
    surfaceFinish: 'Brushed',
    dimensions: '400x800mm',
    format: 'Slab',
    origin: 'Muğla, Turkey',
    tr: {
      name: 'Geliştirme Mermeri 03',
      slug: 'gelistirme-mermeri-03',
      description: 'Geliştirme amaçlı oluşturulmuş example mermer ürünü. Fırçalanmış yüzey.',
      tagline: 'Fırçalanmış yüzey example',
      seoTitle: 'Geliştirme Mermeri 03 — Example',
      seoDescription: 'Geliştirme amaçlı example mermer ürünü.',
    },
    en: {
      name: 'Development Marble 03',
      slug: 'development-marble-03',
      description: 'Development-purpose example marble product. Brushed surface.',
      tagline: 'Brushed surface example',
      seoTitle: 'Development Marble 03 — Example',
      seoDescription: 'Development-purpose example mermer ürünü.',
    },
    isFeatured: false,
    collections: ['contemporary-stones'],
    applications: ['residential', 'commercial'],
    relatedTo: ['dev-01', 'dev-05'],
  },
  {
    identifier: 'dev-04',
    mediaFile: '/placeholders/product-04.svg',
    mediaWidth: 800,
    mediaHeight: 600,
    surfaceFinish: 'Leathered',
    dimensions: '300x600mm',
    format: 'Tile',
    origin: 'Eskişehir, Turkey',
    tr: {
      name: 'Geliştirme Mermeri 04',
      slug: 'gelistirme-mermeri-04',
      description: 'Geliştirme amaçlı oluşturulmuş example mermer ürünü. Deri yüzey dokusu.',
      tagline: 'Deri yüzey example',
      seoTitle: 'Geliştirme Mermeri 04 — Example',
      seoDescription: 'Geliştirme amaçlı example mermer ürünü.',
    },
    en: {
      name: 'Development Marble 04',
      slug: 'development-marble-04',
      description: 'Development-purpose example marble product. Leathered surface texture.',
      tagline: 'Leathered surface example',
      seoTitle: 'Development Marble 04 — Example',
      seoDescription: 'Development-purpose example marble product.',
    },
    isFeatured: false,
    collections: ['contemporary-stones'],
    applications: ['hospitality', 'commercial'],
    relatedTo: ['dev-02', 'dev-06'],
  },
  {
    identifier: 'dev-05',
    mediaFile: '/placeholders/product-05.svg',
    mediaWidth: 800,
    mediaHeight: 600,
    surfaceFinish: 'Honed',
    dimensions: '600x1200mm',
    format: 'Slab',
    origin: 'Afyon, Turkey',
    tr: {
      name: 'Geliştirme Mermeri 05',
      slug: 'gelistirme-mermeri-05',
      description: 'Geliştirme amaçlı oluşturulmuş example mermer ürünü. Büyük ebat slab.',
      tagline: 'Büyük ebat example',
      seoTitle: 'Geliştirme Mermeri 05 — Example',
      seoDescription: 'Geliştirme amaçlı example mermer ürünü.',
    },
    en: {
      name: 'Development Marble 05',
      slug: 'development-marble-05',
      description: 'Development-purpose example marble product. Large format slab.',
      tagline: 'Large format example',
      seoTitle: 'Development Marble 05 — Example',
      seoDescription: 'Development-purpose example marble product.',
    },
    isFeatured: true,
    featuredOrder: 3,
    collections: ['architectural-stones'],
    applications: ['residential', 'hospitality', 'commercial'],
    relatedTo: ['dev-03', 'dev-07'],
  },
  {
    identifier: 'dev-06',
    mediaFile: '/placeholders/product-06.svg',
    mediaWidth: 800,
    mediaHeight: 600,
    surfaceFinish: 'Polished',
    dimensions: '400x400mm',
    format: 'Tile',
    origin: 'İzmir, Turkey',
    tr: {
      name: 'Geliştirme Mermeri 06',
      slug: 'gelistirme-mermeri-06',
      description: 'Geliştirme amaçlı oluşturulmuş example mermer ürünü. Kare format.',
      tagline: 'Kare format example',
      seoTitle: 'Geliştirme Mermeri 06 — Example',
      seoDescription: 'Geliştirme amaçlı example mermer ürünü.',
    },
    en: {
      name: 'Development Marble 06',
      slug: 'development-marble-06',
      description: 'Development-purpose example marble product. Square format.',
      tagline: 'Square format example',
      seoTitle: 'Development Marble 06 — Example',
      seoDescription: 'Development-purpose example marble product.',
    },
    isFeatured: false,
    collections: ['architectural-stones'],
    applications: ['commercial'],
    relatedTo: ['dev-04', 'dev-08'],
  },
  {
    identifier: 'dev-07',
    mediaFile: '/placeholders/product-07.svg',
    mediaWidth: 800,
    mediaHeight: 600,
    surfaceFinish: 'Flamed',
    dimensions: '300x600mm',
    format: 'Tile',
    origin: 'Burdur, Turkey',
    tr: {
      name: 'Geliştirme Mermeri 07',
      slug: 'gelistirme-mermeri-07',
      description: 'Geliştirme amaçlı oluşturulmuş example mermer ürünü. Alevli yüzey.',
      tagline: 'Alevli yüzey example',
      seoTitle: 'Geliştirme Mermeri 07 — Example',
      seoDescription: 'Geliştirme amaçlı example mermer ürünü.',
    },
    en: {
      name: 'Development Marble 07',
      slug: 'development-marble-07',
      description: 'Development-purpose example marble product. Flamed surface.',
      tagline: 'Flamed surface example',
      seoTitle: 'Development Marble 07 — Example',
      seoDescription: 'Development-purpose example marble product.',
    },
    isFeatured: false,
    collections: ['classic-stones', 'architectural-stones'],
    applications: ['residential'],
    relatedTo: ['dev-05'],
  },
  {
    identifier: 'dev-08',
    mediaFile: '/placeholders/product-08.svg',
    mediaWidth: 800,
    mediaHeight: 600,
    surfaceFinish: 'Sawn',
    dimensions: '600x600mm',
    format: 'Slab',
    origin: 'Kütahya, Turkey',
    tr: {
      name: 'Geliştirme Mermeri 08',
      slug: 'gelistirme-mermeri-08',
      description: 'Geliştirme amaçlı oluşturulmuş example mermer ürünü. Kesilmiş yüzey.',
      tagline: 'Kesilmiş yüzey example',
      seoTitle: 'Geliştirme Mermeri 08 — Example',
      seoDescription: 'Geliştirme amaçlı example mermer ürünü.',
    },
    en: {
      name: 'Development Marble 08',
      slug: 'development-marble-08',
      description: 'Development-purpose example marble product. Sawn surface.',
      tagline: 'Sawn surface example',
      seoTitle: 'Development Marble 08 — Example',
      seoDescription: 'Development-purpose example marble product.',
    },
    isFeatured: false,
    collections: ['contemporary-stones'],
    applications: ['hospitality'],
    relatedTo: ['dev-06'],
  },
];

const COLLECTIONS: Record<string, SeedCollection> = {
  'classic-stones': {
    mediaFile: '/placeholders/collection-cover.svg',
    tr: {
      name: 'Klasik Taşlar',
      slug: 'klasik-taslar',
      description: 'Klasik mermer ve doğal taş koleksiyonu. Geleneksel dokular ve zamansız tasarım exampleları.',
      seoTitle: 'Klasik Taşlar — Example Koleksiyon',
      seoDescription: 'Klasik mermer ve doğal taş koleksiyonu example.',
    },
    en: {
      name: 'Classic Stones',
      slug: 'classic-stones',
      description: 'Classic marble and natural stone collection. Traditional textures and timeless design examples.',
      seoTitle: 'Classic Stones — Example Collection',
      seoDescription: 'Classic marble and natural stone collection example.',
    },
    displayOrder: 1,
  },
  'contemporary-stones': {
    mediaFile: '/placeholders/collection-cover.svg',
    tr: {
      name: 'Çağdaş Taşlar',
      slug: 'cagdas-taslar',
      description: 'Çağdaş tasarım anlayışına yönelik doğal taş koleksiyonu. Modern dokular ve yüzey bitişleri.',
      seoTitle: 'Çağdaş Taşlar — Example Koleksiyon',
      seoDescription: 'Çağdaş doğal taş koleksiyonu example.',
    },
    en: {
      name: 'Contemporary Stones',
      slug: 'contemporary-stones',
      description: 'Natural stone collection for contemporary design. Modern textures and surface finishes.',
      seoTitle: 'Contemporary Stones — Example Collection',
      seoDescription: 'Contemporary natural stone collection example.',
    },
    displayOrder: 2,
  },
  'architectural-stones': {
    mediaFile: '/placeholders/collection-cover.svg',
    tr: {
      name: 'Mimari Taşlar',
      slug: 'mimari-taslar',
      description: 'Mimari projeler için tasarlanmış doğal taş koleksiyonu. Büyük ebat ve özel yüzey seçenekleri.',
      seoTitle: 'Mimari Taşlar — Example Koleksiyon',
      seoDescription: 'Mimari doğal taş koleksiyonu example.',
    },
    en: {
      name: 'Architectural Stones',
      slug: 'architectural-stones',
      description: 'Natural stone collection designed for architectural projects. Large format and special surface options.',
      seoTitle: 'Architectural Stones — Example Collection',
      seoDescription: 'Architectural natural stone collection example.',
    },
    displayOrder: 3,
  },
};

const APPLICATIONS: Record<string, SeedApplication> = {
  residential: {
    mediaFile: '/placeholders/collection-cover.svg',
    tr: {
      name: 'Konut',
      slug: 'konut',
      description: 'Konut projeleri için doğal taş uygulama exampleları. Mutfak, banyo ve yaşam alanları.',
      seoTitle: 'Konut Uygulamaları — Example',
      seoDescription: 'Konut projeleri için doğal taş uygulamaları example.',
    },
    en: {
      name: 'Residential',
      slug: 'residential',
      description: 'Natural stone application examples for residential projects. Kitchen, bathroom and living spaces.',
      seoTitle: 'Residential Applications — Example',
      seoDescription: 'Natural stone applications for residential projects example.',
    },
    displayOrder: 1,
  },
  hospitality: {
    mediaFile: '/placeholders/collection-cover.svg',
    tr: {
      name: 'Otel ve Konaklama',
      slug: 'otel-ve-konaklama',
      description: 'Otel ve konaklama projeleri için doğal taş uygulama exampleları. Lobi, koridor ve süit alanları.',
      seoTitle: 'Otel ve Konaklama — Example',
      seoDescription: 'Otel ve konaklama projeleri için doğal taş uygulamaları example.',
    },
    en: {
      name: 'Hospitality',
      slug: 'hospitality',
      description: 'Natural stone application examples for hotel and hospitality projects. Lobby, corridor and suite areas.',
      seoTitle: 'Hospitality Applications — Example',
      seoDescription: 'Natural stone applications for hospitality projects example.',
    },
    displayOrder: 2,
  },
  commercial: {
    mediaFile: '/placeholders/collection-cover.svg',
    tr: {
      name: 'Ticari',
      slug: 'ticari',
      description: 'Ticari projeler için doğal taş uygulama exampleları. Ofis, mağaza ve kamusal alanlar.',
      seoTitle: 'Ticari Uygulamalar — Example',
      seoDescription: 'Ticari projeler için doğal taş uygulamaları example.',
    },
    en: {
      name: 'Commercial',
      slug: 'commercial',
      description: 'Natural stone application examples for commercial projects. Office, retail and public spaces.',
      seoTitle: 'Commercial Applications — Example',
      seoDescription: 'Natural stone applications for commercial projects example.',
    },
    displayOrder: 3,
  },
};

const PROJECTS: SeedProject[] = [
  {
    mediaFile: '/placeholders/collection-cover.svg',
    location: 'İstanbul, Turkey',
    projectType: 'Hotel Lobby',
    tr: {
      name: 'Geliştirme Mimari Projesi',
      slug: 'gelistirme-mimari-projesi',
      description: 'Geliştirme amaçlı oluşturulmuş example mimari proje. Gerçek bir proje bilgisi içermemektedir.',
      seoTitle: 'Geliştirme Mimari Projesi — Example',
      seoDescription: 'Geliştirme amaçlı example mimari proje.',
    },
    en: {
      name: 'Development Architectural Project',
      slug: 'development-architectural-project',
      description: 'Development-purpose example architectural project. Does not contain real project information.',
      seoTitle: 'Development Architectural Project — Example',
      seoDescription: 'Development-purpose example architectural project.',
    },
    products: ['dev-01', 'dev-05'],
    applications: ['hospitality'],
  },
];

const JOURNAL_ARTICLES: SeedJournal[] = [
  {
    mediaFile: '/placeholders/product-01.svg',
    publicationDate: '2026-01-15',
    authorName: 'Development Author',
    tr: {
      name: 'Doğal Taş Seçimi Hakkında',
      slug: 'dogal-tas-secimi-hakkinda',
      description: 'Doğal taş seçimi sürecinde dikkat edilmesi gereken temel faktörler hakkında development example makalesi.',
      seoTitle: 'Doğal Taş Seçimi — Example Makale',
      seoDescription: 'Doğal taş seçimi hakkında example makale.',
    },
    en: {
      name: 'Understanding Natural Stone Selection',
      slug: 'understanding-natural-stone-selection',
      description: 'Development example article about key factors to consider in the natural stone selection process.',
      seoTitle: 'Natural Stone Selection — Example Article',
      seoDescription: 'Article about natural stone selection example.',
    },
    referencedProducts: ['dev-01', 'dev-03'],
    referencedApplications: ['residential'],
  },
  {
    mediaFile: '/placeholders/product-02.svg',
    publicationDate: '2026-03-20',
    authorName: 'Development Author',
    tr: {
      name: 'Çağdaş Mimarlıkta Taş Kullanımı',
      slug: 'cagdas-mimarlikta-tas-kullanimi',
      description: 'Çağdaş mimari projelerde doğal taş kullanımı trendleri hakkında development example makalesi.',
      seoTitle: 'Çağdaş Mimarlıkta Taş — Example Makale',
      seoDescription: 'Çağdaş mimarlıkta taş kullanımı hakkında example makale.',
    },
    en: {
      name: 'Stone in Contemporary Architecture',
      slug: 'stone-in-contemporary-architecture',
      description: 'Development example article about natural stone usage trends in contemporary architectural projects.',
      seoTitle: 'Stone in Architecture — Example Article',
      seoDescription: 'Article about stone in contemporary architecture example.',
    },
    referencedProducts: ['dev-02', 'dev-04'],
    referencedApplications: ['commercial', 'hospitality'],
  },
  {
    mediaFile: '/placeholders/product-03.svg',
    publicationDate: '2026-06-10',
    authorName: 'Development Author',
    tr: {
      name: 'Ocaktan Bitiş Yüzeyine',
      slug: 'ocaktan-bitis-yuzeyine',
      description: 'Doğal taşın ocaktan çıkarılmasından bitiş yüzeyine kadar olan süreç hakkında development example makalesi.',
      seoTitle: 'Ocaktan Bitiş Yüzeyine — Example Makale',
      seoDescription: 'Ocaktan bitiş yüzeyine kadar süreç hakkında example makale.',
    },
    en: {
      name: 'From Quarry Block to Finished Surface',
      slug: 'from-quarry-block-to-finished-surface',
      description: 'Development example article about the process from quarry extraction to finished surface.',
      seoTitle: 'Quarry to Surface — Example Article',
      seoDescription: 'Article about quarry to finished surface process example.',
    },
    referencedProducts: ['dev-05', 'dev-07'],
    referencedApplications: ['residential', 'commercial'],
  },
];

const COMPANY_CONTENTS: SeedCompanyContent[] = [
  {
    kind: 'ABOUT',
    mediaFile: '/placeholders/collection-cover.svg',
    tr: {
      name: 'Hakkımızda',
      slug: 'hakkimizda',
      description: 'Bu sayfa geliştirme amaçlı oluşturulmuş example şirket bilgisi içermektedir. Gerçek şirket bilgisi değildir.',
      seoTitle: 'Hakkımızda — Example',
      seoDescription: 'Geliştirme amaçlı example şirket bilgisi.',
    },
    en: {
      name: 'About Us',
      slug: 'about-us',
      description: 'This page contains development-purpose example company information. Not real company information.',
      seoTitle: 'About Us — Example',
      seoDescription: 'Development-purpose example company information.',
    },
    referencedProducts: ['dev-01', 'dev-05'],
    referencedJournalSlugs: ['dogal-tas-secimi-hakkinda'],
  },
  {
    kind: 'QUARRY',
    mediaFile: '/placeholders/collection-cover.svg',
    tr: {
      name: 'Ocağımız',
      slug: 'ocagimiz',
      description: 'Bu sayfa geliştirme amaçlı oluşturulmuş example ocak bilgisi içermektedir. Gerçek ocak bilgisi değildir.',
      seoTitle: 'Ocağımız — Example',
      seoDescription: 'Geliştirme amaçlı example ocak bilgisi.',
    },
    en: {
      name: 'Our Quarry',
      slug: 'our-quarry',
      description: 'This page contains development-purpose example quarry information. Not real quarry information.',
      seoTitle: 'Our Quarry — Example',
      seoDescription: 'Development-purpose example quarry information.',
    },
    referencedProducts: ['dev-01', 'dev-03'],
    referencedJournalSlugs: [],
  },
  {
    kind: 'FACTORY',
    mediaFile: '/placeholders/collection-cover.svg',
    tr: {
      name: 'Fabrikamız',
      slug: 'fabrikamiz',
      description: 'Bu sayfa geliştirme amaçlı oluşturulmuş example fabrika bilgisi içermektedir. Gerçek fabrika bilgisi değildir.',
      seoTitle: 'Fabrikamız — Example',
      seoDescription: 'Geliştirme amaçlı example fabrika bilgisi.',
    },
    en: {
      name: 'Our Factory',
      slug: 'our-factory',
      description: 'This page contains development-purpose example factory information. Not real factory information.',
      seoTitle: 'Our Factory — Example',
      seoDescription: 'Development-purpose example factory information.',
    },
    referencedProducts: ['dev-02', 'dev-04'],
    referencedJournalSlugs: [],
  },
];

// ============================================================
// Environment Guard
// ============================================================

function checkEnvironment(): void {
  const url = process.env.DATABASE_URL ?? '';
  if (!url) {
    console.error('DATABASE_URL is not set. Aborting seed.');
    process.exit(1);
  }
  if (url.includes('production') || url.includes('prod')) {
    console.error('DATABASE_URL appears to point to a production database. Aborting seed.');
    process.exit(1);
  }
  console.log(`[seed] DATABASE_URL detected — proceeding with seed.`);
}

// ============================================================
// Utility: get or create
// ============================================================

async function getOrCreateUser(prisma: PrismaClient) {
  const email = 'dev@marble-platform.local';
  const existing = await prisma.internalUser.findUnique({ where: { email } });
  if (existing) return existing;
  return prisma.internalUser.create({
    data: {
      email,
      name: 'Development User',
      isActive: true,
      roles: {
        create: {
          role: {
            connectOrCreate: {
              where: { name: 'admin' },
              create: { name: 'admin' },
            },
          },
        },
      },
    },
  });
}

// ============================================================
// Core Seed Functions
// ============================================================

async function seedMediaAsset(
  tx: Prisma.TransactionClient,
  file: string,
  width: number,
  height: number
) {
  const existing = await tx.mediaAsset.findFirst({
    where: { sourceReference: file },
  });
  if (existing) return existing;

  return tx.mediaAsset.create({
    data: {
      mediaType: 'IMAGE',
      sourceReference: file,
      rightsState: 'VERIFIED',
      width,
      height,
      aspectRatio: `${width}/${height}`,
      fileType: 'image/svg+xml',
      fileSize: 0,
    },
  });
}

async function seedContentItemWithVariant(
  tx: Prisma.TransactionClient,
  type: 'PRODUCT' | 'COLLECTION' | 'APPLICATION' | 'PROJECT' | 'JOURNAL_ARTICLE' | 'COMPANY_CONTENT',
  tr: LocaleContent,
  en: LocaleContent,
  opts: {
    aggregateState?: 'ACTIVE' | 'DRAFT';
    isFeatured?: boolean;
    featuredOrder?: number;
    displayOrder?: number;
  } = {}
) {
  const trVariant = await tx.contentVariant.findFirst({
    where: { slug: tr.slug, locale: 'tr' },
  });

  if (trVariant) {
    return { contentItemId: trVariant.contentItemId, isNew: false };
  }

  const contentItem = await tx.contentItem.create({
    data: {
      type,
      aggregateState: opts.aggregateState ?? 'ACTIVE',
    },
  });

  const variantData: Prisma.ContentVariantCreateManyInput[] = [
    {
      contentItemId: contentItem.id,
      locale: 'tr',
      lifecycleState: 'PUBLISHED',
      slug: tr.slug,
      name: tr.name,
      description: tr.description,
      tagline: tr.tagline,
      seoTitle: tr.seoTitle,
      seoDescription: tr.seoDescription,
      isFeatured: opts.isFeatured ?? false,
      featuredOrder: opts.featuredOrder,
      displayOrder: opts.displayOrder,
    },
    {
      contentItemId: contentItem.id,
      locale: 'en',
      lifecycleState: 'PUBLISHED',
      slug: en.slug,
      name: en.name,
      description: en.description,
      tagline: en.tagline,
      seoTitle: en.seoTitle,
      seoDescription: en.seoDescription,
      isFeatured: opts.isFeatured ?? false,
      featuredOrder: opts.featuredOrder,
      displayOrder: opts.displayOrder,
    },
  ];

  await tx.contentVariant.createMany({ data: variantData });

  return { contentItemId: contentItem.id, isNew: true };
}

async function seedRevisionAndApproval(
  tx: Prisma.TransactionClient,
  contentItemId: string,
  userId: string
) {
  const variants = await tx.contentVariant.findMany({
    where: { contentItemId },
  });

  for (const variant of variants) {
    const existingRevision = await tx.contentRevision.findFirst({
      where: {
        contentVariantId: variant.id,
        revisionNumber: 1,
      },
    });

    let revision = existingRevision;
    if (!revision) {
      revision = await tx.contentRevision.create({
        data: {
          contentVariantId: variant.id,
          revisionNumber: 1,
          materialSnapshot: JSON.stringify({
            name: variant.name,
            slug: variant.slug,
            locale: variant.locale,
          }),
        },
      });
    }

    const existingApproval = await tx.approval.findFirst({
      where: {
        contentRevisionId: revision.id,
        approverId: userId,
      },
    });

    if (!existingApproval) {
      await tx.approval.create({
        data: {
          contentRevisionId: revision.id,
          approverId: userId,
          outcome: 'APPROVED',
          coveredLocale: variant.locale,
          notes: 'Development seed auto-approval',
        },
      });
    }
  }
}

async function seedMediaForVariant(
  tx: Prisma.TransactionClient,
  variantId: string,
  mediaFile: string,
  width: number,
  height: number,
  role: 'PRIMARY' | 'HERO' | 'GALLERY',
  altText: string
) {
  const asset = await seedMediaAsset(tx, mediaFile, width, height);

  const existing = await tx.contentMedia.findFirst({
    where: {
      contentVariantId: variantId,
      mediaAssetId: asset.id,
      role,
    },
  });

  if (!existing) {
    await tx.contentMedia.create({
      data: {
        contentVariantId: variantId,
        mediaAssetId: asset.id,
        role,
        displayOrder: role === 'PRIMARY' ? 0 : role === 'HERO' ? 0 : 1,
        altText,
      },
    });
  }
}

// ============================================================
// Main Seed
// ============================================================

async function main() {
  checkEnvironment();

  console.log('[seed] Starting development seed...');

  // 1. Create/get governance user
  const user = await getOrCreateUser(prisma);
  console.log(`[seed] Governance user ready: ${user.email}`);

  // 2. Create content items + variants via transaction
  const contentIds: Record<string, string> = {};

  await prisma.$transaction(async (tx) => {
    // Products
    for (const product of PRODUCTS) {
      const { contentItemId } = await seedContentItemWithVariant(
        tx,
        'PRODUCT',
        product.tr,
        product.en,
        {
          aggregateState: 'ACTIVE',
          isFeatured: product.isFeatured,
          featuredOrder: product.featuredOrder,
        }
      );
      contentIds[product.identifier] = contentItemId;

      // Create product extension
      const existingProduct = await tx.product.findUnique({
        where: { contentItemId },
      });
      if (!existingProduct) {
        await tx.product.create({
          data: {
            contentItemId,
            internalIdentifier: product.identifier,
            surfaceFinish: product.surfaceFinish,
            dimensions: product.dimensions,
            format: product.format,
            origin: product.origin,
          },
        });
      }

      // Seed revision + approval for both locales
      await seedRevisionAndApproval(tx, contentItemId, user.id);

      // Seed media
      const trVariant = await tx.contentVariant.findFirst({
        where: { contentItemId, locale: 'tr' },
      });
      if (trVariant) {
        await seedMediaForVariant(
          tx,
          trVariant.id,
          product.mediaFile,
          product.mediaWidth,
          product.mediaHeight,
          'PRIMARY',
          `${product.tr.name} — Development placeholder`
        );
      }
    }

    // Collections
    for (const [key, collection] of Object.entries(COLLECTIONS)) {
      const { contentItemId } = await seedContentItemWithVariant(
        tx,
        'COLLECTION',
        collection.tr,
        collection.en,
        { aggregateState: 'ACTIVE', displayOrder: collection.displayOrder }
      );
      contentIds[key] = contentItemId;

      const existing = await tx.collection.findUnique({
        where: { contentItemId },
      });
      if (!existing) {
        await tx.collection.create({ data: { contentItemId } });
      }

      await seedRevisionAndApproval(tx, contentItemId, user.id);

      const trVariant = await tx.contentVariant.findFirst({
        where: { contentItemId, locale: 'tr' },
      });
      if (trVariant) {
        await seedMediaForVariant(
          tx,
          trVariant.id,
          collection.mediaFile,
          1200,
          600,
          'PRIMARY',
          `${collection.tr.name} — Development placeholder`
        );
      }
    }

    // Applications
    for (const [key, app] of Object.entries(APPLICATIONS)) {
      const { contentItemId } = await seedContentItemWithVariant(
        tx,
        'APPLICATION',
        app.tr,
        app.en,
        { aggregateState: 'ACTIVE', displayOrder: app.displayOrder }
      );
      contentIds[key] = contentItemId;

      const existing = await tx.application.findUnique({
        where: { contentItemId },
      });
      if (!existing) {
        await tx.application.create({ data: { contentItemId } });
      }

      await seedRevisionAndApproval(tx, contentItemId, user.id);

      const trVariant = await tx.contentVariant.findFirst({
        where: { contentItemId, locale: 'tr' },
      });
      if (trVariant) {
        await seedMediaForVariant(
          tx,
          trVariant.id,
          app.mediaFile,
          1200,
          600,
          'PRIMARY',
          `${app.tr.name} — Development placeholder`
        );
      }
    }

    // Projects
    for (const project of PROJECTS) {
      const { contentItemId } = await seedContentItemWithVariant(
        tx,
        'PROJECT',
        project.tr,
        project.en,
        { aggregateState: 'ACTIVE' }
      );
      contentIds[project.tr.slug] = contentItemId;

      const existing = await tx.project.findUnique({
        where: { contentItemId },
      });
      if (!existing) {
        await tx.project.create({
          data: {
            contentItemId,
            location: project.location,
            projectType: project.projectType,
          },
        });
      }

      await seedRevisionAndApproval(tx, contentItemId, user.id);

      const trVariant = await tx.contentVariant.findFirst({
        where: { contentItemId, locale: 'tr' },
      });
      if (trVariant) {
        await seedMediaForVariant(
          tx,
          trVariant.id,
          project.mediaFile,
          1200,
          600,
          'HERO',
          `${project.tr.name} — Development placeholder`
        );
      }
    }

    // Journal articles
    for (const article of JOURNAL_ARTICLES) {
      const { contentItemId } = await seedContentItemWithVariant(
        tx,
        'JOURNAL_ARTICLE',
        article.tr,
        article.en,
        { aggregateState: 'ACTIVE' }
      );
      contentIds[article.tr.slug] = contentItemId;

      const existing = await tx.journalArticle.findUnique({
        where: { contentItemId },
      });
      if (!existing) {
        await tx.journalArticle.create({
          data: {
            contentItemId,
            publicationDate: new Date(article.publicationDate),
            authorName: article.authorName,
          },
        });
      }

      await seedRevisionAndApproval(tx, contentItemId, user.id);

      const trVariant = await tx.contentVariant.findFirst({
        where: { contentItemId, locale: 'tr' },
      });
      if (trVariant) {
        await seedMediaForVariant(
          tx,
          trVariant.id,
          article.mediaFile,
          800,
          600,
          'PRIMARY',
          `${article.tr.name} — Development placeholder`
        );
      }
    }

    // Company content
    for (const content of COMPANY_CONTENTS) {
      const { contentItemId } = await seedContentItemWithVariant(
        tx,
        'COMPANY_CONTENT',
        content.tr,
        content.en,
        { aggregateState: 'ACTIVE' }
      );
      contentIds[`company-${content.kind}`] = contentItemId;

      const existing = await tx.companyContent.findUnique({
        where: { contentItemId },
      });
      if (!existing) {
        await tx.companyContent.create({
          data: { contentItemId, kind: content.kind },
        });
      }

      await seedRevisionAndApproval(tx, contentItemId, user.id);

      const trVariant = await tx.contentVariant.findFirst({
        where: { contentItemId, locale: 'tr' },
      });
      if (trVariant) {
        await seedMediaForVariant(
          tx,
          trVariant.id,
          content.mediaFile,
          1200,
          600,
          'PRIMARY',
          `${content.tr.name} — Development placeholder`
        );
      }
    }
  });

  console.log('[seed] Content items created. Seeding relationships...');

  // 3. Seed junction tables (relationships)
  await prisma.$transaction(async (tx) => {
    // Product ↔ Collection
    for (const product of PRODUCTS) {
      const productId = contentIds[product.identifier];
      for (const collSlug of product.collections) {
        const collectionId = contentIds[collSlug];
        if (!collectionId) continue;
        await tx.productCollection.upsert({
          where: {
            productId_collectionId: { productId, collectionId },
          },
          create: { productId, collectionId },
          update: {},
        });
      }
    }

    // Product ↔ Application
    for (const product of PRODUCTS) {
      const productId = contentIds[product.identifier];
      for (const appKey of product.applications) {
        const applicationId = contentIds[appKey];
        if (!applicationId) continue;
        await tx.productApplication.upsert({
          where: {
            productId_applicationId: { productId, applicationId },
          },
          create: { productId, applicationId },
          update: {},
        });
      }
    }

    // Related products
    for (const product of PRODUCTS) {
      const sourceId = contentIds[product.identifier];
      for (const targetIdentifier of product.relatedTo) {
        const targetId = contentIds[targetIdentifier];
        if (!targetId || sourceId === targetId) continue;
        await tx.relatedProduct.upsert({
          where: {
            sourceProductId_targetProductId: {
              sourceProductId: sourceId,
              targetProductId: targetId,
            },
          },
          create: { sourceProductId: sourceId, targetProductId: targetId },
          update: {},
        });
      }
    }

    // Project ↔ Product
    for (const project of PROJECTS) {
      const projectId = contentIds[project.tr.slug];
      if (!projectId) continue;
      for (const prodIdentifier of project.products) {
        const productId = contentIds[prodIdentifier];
        if (!productId) continue;
        await tx.projectProduct.upsert({
          where: {
            projectId_productId: { projectId, productId },
          },
          create: { projectId, productId },
          update: {},
        });
      }
    }

    // Project ↔ Application
    for (const project of PROJECTS) {
      const projectId = contentIds[project.tr.slug];
      if (!projectId) continue;
      for (const appKey of project.applications) {
        const applicationId = contentIds[appKey];
        if (!applicationId) continue;
        await tx.projectApplication.upsert({
          where: {
            projectId_applicationId: { projectId, applicationId },
          },
          create: { projectId, applicationId },
          update: {},
        });
      }
    }

    // Journal references
    for (const article of JOURNAL_ARTICLES) {
      const journalId = contentIds[article.tr.slug];
      if (!journalId) continue;

      for (const prodIdentifier of article.referencedProducts) {
        const productId = contentIds[prodIdentifier];
        if (!productId) continue;
        const existing = await tx.journalContentReference.findFirst({
          where: {
            journalArticleId: journalId,
            productProductId: productId,
          },
        });
        if (!existing) {
          await tx.journalContentReference.create({
            data: {
              journalArticleId: journalId,
              productProductId: productId,
            },
          });
        }
      }

      for (const appKey of article.referencedApplications) {
        const applicationId = contentIds[appKey];
        if (!applicationId) continue;
        const existing = await tx.journalContentReference.findFirst({
          where: {
            journalArticleId: journalId,
            applicationId,
          },
        });
        if (!existing) {
          await tx.journalContentReference.create({
            data: {
              journalArticleId: journalId,
              applicationId,
            },
          });
        }
      }
    }

    // Company content references
    for (const content of COMPANY_CONTENTS) {
      const companyContentId = contentIds[`company-${content.kind}`];
      if (!companyContentId) continue;

      for (const prodIdentifier of content.referencedProducts) {
        const productId = contentIds[prodIdentifier];
        if (!productId) continue;
        const existing = await tx.companyContentReference.findFirst({
          where: {
            companyContentId,
            productProductId: productId,
          },
        });
        if (!existing) {
          await tx.companyContentReference.create({
            data: {
              companyContentId,
              productProductId: productId,
            },
          });
        }
      }

      for (const journalSlug of content.referencedJournalSlugs) {
        const journalId = contentIds[journalSlug];
        if (!journalId) continue;
        const existing = await tx.companyContentReference.findFirst({
          where: {
            companyContentId,
            journalArticleId: journalId,
          },
        });
        if (!existing) {
          await tx.companyContentReference.create({
            data: {
              companyContentId,
              journalArticleId: journalId,
            },
          });
        }
      }
    }
  });

  console.log('[seed] Relationships created.');

  // 4. Print summary
  const counts = await Promise.all([
    prisma.contentItem.count(),
    prisma.contentVariant.count(),
    prisma.contentRevision.count(),
    prisma.approval.count(),
    prisma.mediaAsset.count(),
    prisma.contentMedia.count(),
    prisma.product.count(),
    prisma.collection.count(),
    prisma.application.count(),
    prisma.project.count(),
    prisma.journalArticle.count(),
    prisma.companyContent.count(),
    prisma.productCollection.count(),
    prisma.productApplication.count(),
    prisma.relatedProduct.count(),
    prisma.projectProduct.count(),
    prisma.projectApplication.count(),
    prisma.journalContentReference.count(),
    prisma.companyContentReference.count(),
  ]);

  console.log('\n[seed] ===== SEED COMPLETE =====');
  console.log(`[seed] ContentItems:      ${counts[0]}`);
  console.log(`[seed] ContentVariants:   ${counts[1]}`);
  console.log(`[seed] ContentRevisions:  ${counts[2]}`);
  console.log(`[seed] Approvals:         ${counts[3]}`);
  console.log(`[seed] MediaAssets:       ${counts[4]}`);
  console.log(`[seed] ContentMedia:      ${counts[5]}`);
  console.log(`[seed] Products:          ${counts[6]}`);
  console.log(`[seed] Collections:       ${counts[7]}`);
  console.log(`[seed] Applications:      ${counts[8]}`);
  console.log(`[seed] Projects:          ${counts[9]}`);
  console.log(`[seed] JournalArticles:   ${counts[10]}`);
  console.log(`[seed] CompanyContents:   ${counts[11]}`);
  console.log(`[seed] ProductCollections: ${counts[12]}`);
  console.log(`[seed] ProductApps:       ${counts[13]}`);
  console.log(`[seed] RelatedProducts:   ${counts[14]}`);
  console.log(`[seed] ProjectProducts:   ${counts[15]}`);
  console.log(`[seed] ProjectApps:       ${counts[16]}`);
  console.log(`[seed] JournalRefs:       ${counts[17]}`);
  console.log(`[seed] CompanyRefs:       ${counts[18]}`);
  console.log('[seed] =========================\n');
}

main()
  .catch((e) => {
    console.error('[seed] Fatal error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
