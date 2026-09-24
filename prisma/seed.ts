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
import { hashPassword } from '../src/lib/auth/password';

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
    identifier: 'demo-ivory',
    mediaFile: '/demo/images/demo-marble-ivory.svg',
    mediaWidth: 1200,
    mediaHeight: 900,
    surfaceFinish: 'Honed',
    dimensions: '300x600mm',
    format: 'Slab',
    origin: 'Afyon, Turkey',
    tr: {
      name: 'Demo Ivory Stone',
      slug: 'demo-ivory-stone',
      description: 'Demo amaçlı oluşturulmuş ivory mermer ürünü. Klasik beyaz mermer example.',
      tagline: 'Klasik beyaz mermer',
      seoTitle: 'Demo Ivory Stone — Marble Platform',
      seoDescription: 'Demo ivory mermer ürünü.',
    },
    en: {
      name: 'Demo Ivory Stone',
      slug: 'demo-ivory-stone',
      description: 'Demo ivory marble product. Classic white marble example.',
      tagline: 'Classic white marble',
      seoTitle: 'Demo Ivory Stone — Marble Platform',
      seoDescription: 'Demo ivory marble product.',
    },
    isFeatured: true,
    featuredOrder: 1,
    collections: ['classic-stones'],
    applications: ['residential', 'hospitality'],
    relatedTo: ['demo-charcoal', 'demo-green'],
  },
  {
    identifier: 'demo-charcoal',
    mediaFile: '/demo/images/demo-marble-charcoal.svg',
    mediaWidth: 1200,
    mediaHeight: 900,
    surfaceFinish: 'Polished',
    dimensions: '600x600mm',
    format: 'Tile',
    origin: 'Bilecik, Turkey',
    tr: {
      name: 'Demo Dark Stone',
      slug: 'demo-dark-stone',
      description: 'Demo amaçlı oluşturulmuş koyu mermer ürünü. Modern ve şık tasarım.',
      tagline: 'Parlak yüzey',
      seoTitle: 'Demo Dark Stone — Marble Platform',
      seoDescription: 'Demo koyu mermer ürünü.',
    },
    en: {
      name: 'Demo Dark Stone',
      slug: 'demo-dark-stone',
      description: 'Demo dark marble product. Modern and elegant design.',
      tagline: 'Polished surface',
      seoTitle: 'Demo Dark Stone — Marble Platform',
      seoDescription: 'Demo dark marble product.',
    },
    isFeatured: true,
    featuredOrder: 2,
    collections: ['classic-stones'],
    applications: ['commercial'],
    relatedTo: ['demo-ivory', 'demo-navy'],
  },
  {
    identifier: 'demo-green',
    mediaFile: '/demo/images/demo-marble-green.svg',
    mediaWidth: 1200,
    mediaHeight: 900,
    surfaceFinish: 'Brushed',
    dimensions: '400x800mm',
    format: 'Slab',
    origin: 'Muğla, Turkey',
    tr: {
      name: 'Demo Green Stone',
      slug: 'demo-green-stone',
      description: 'Demo amaçlı oluşturulmuş yeşil mermer ürünü. Doğal tonlar.',
      tagline: 'Fırçalanmış yüzey',
      seoTitle: 'Demo Green Stone — Marble Platform',
      seoDescription: 'Demo yeşil mermer ürünü.',
    },
    en: {
      name: 'Demo Green Stone',
      slug: 'demo-green-stone',
      description: 'Demo green marble product. Natural tones.',
      tagline: 'Brushed surface',
      seoTitle: 'Demo Green Stone — Marble Platform',
      seoDescription: 'Demo green marble product.',
    },
    isFeatured: false,
    collections: ['contemporary-stones'],
    applications: ['residential', 'commercial'],
    relatedTo: ['demo-ivory', 'demo-beige'],
  },
  {
    identifier: 'demo-beige',
    mediaFile: '/demo/images/demo-marble-beige.svg',
    mediaWidth: 1200,
    mediaHeight: 900,
    surfaceFinish: 'Leathered',
    dimensions: '300x600mm',
    format: 'Tile',
    origin: 'Eskişehir, Turkey',
    tr: {
      name: 'Demo Warm Stone',
      slug: 'demo-warm-stone',
      description: 'Demo amaçlı oluşturulmuş sıcak tonlu mermer ürünü. Doğal doku.',
      tagline: 'Deri yüzey',
      seoTitle: 'Demo Warm Stone — Marble Platform',
      seoDescription: 'Demo sıcak tonlu mermer ürünü.',
    },
    en: {
      name: 'Demo Warm Stone',
      slug: 'demo-warm-stone',
      description: 'Demo warm-toned marble product. Natural texture.',
      tagline: 'Leathered surface',
      seoTitle: 'Demo Warm Stone — Marble Platform',
      seoDescription: 'Demo warm-toned marble product.',
    },
    isFeatured: false,
    collections: ['contemporary-stones'],
    applications: ['hospitality', 'commercial'],
    relatedTo: ['demo-charcoal', 'demo-gold'],
  },
  {
    identifier: 'demo-white',
    mediaFile: '/demo/images/demo-marble-white.svg',
    mediaWidth: 1200,
    mediaHeight: 900,
    surfaceFinish: 'Honed',
    dimensions: '600x1200mm',
    format: 'Slab',
    origin: 'Afyon, Turkey',
    tr: {
      name: 'Demo White Stone',
      slug: 'demo-white-stone',
      description: 'Demo amaçlı oluşturulmuş beyaz mermer ürünü. Büyük ebat slab.',
      tagline: 'Büyük ebat',
      seoTitle: 'Demo White Stone — Marble Platform',
      seoDescription: 'Demo beyaz mermer ürünü.',
    },
    en: {
      name: 'Demo White Stone',
      slug: 'demo-white-stone',
      description: 'Demo white marble product. Large format slab.',
      tagline: 'Large format',
      seoTitle: 'Demo White Stone — Marble Platform',
      seoDescription: 'Demo white marble product.',
    },
    isFeatured: true,
    featuredOrder: 3,
    collections: ['architectural-stones'],
    applications: ['residential', 'hospitality', 'commercial'],
    relatedTo: ['demo-green', 'demo-rosso'],
  },
  {
    identifier: 'demo-gold',
    mediaFile: '/demo/images/demo-marble-gold.svg',
    mediaWidth: 1200,
    mediaHeight: 900,
    surfaceFinish: 'Polished',
    dimensions: '400x400mm',
    format: 'Tile',
    origin: 'İzmir, Turkey',
    tr: {
      name: 'Demo Gold Stone',
      slug: 'demo-gold-stone',
      description: 'Demo amaçlı oluşturulmuş altın tonlu mermer ürünü. Lüks tasarım.',
      tagline: 'Kare format',
      seoTitle: 'Demo Gold Stone — Marble Platform',
      seoDescription: 'Demo altın tonlu mermer ürünü.',
    },
    en: {
      name: 'Demo Gold Stone',
      slug: 'demo-gold-stone',
      description: 'Demo gold-toned marble product. Luxury design.',
      tagline: 'Square format',
      seoTitle: 'Demo Gold Stone — Marble Platform',
      seoDescription: 'Demo gold-toned marble product.',
    },
    isFeatured: false,
    collections: ['architectural-stones'],
    applications: ['commercial'],
    relatedTo: ['demo-beige', 'demo-rosso'],
  },
  {
    identifier: 'demo-rosso',
    mediaFile: '/demo/images/demo-marble-rosso.svg',
    mediaWidth: 1200,
    mediaHeight: 900,
    surfaceFinish: 'Flamed',
    dimensions: '300x600mm',
    format: 'Tile',
    origin: 'Burdur, Turkey',
    tr: {
      name: 'Demo Rosso Stone',
      slug: 'demo-rosso-stone',
      description: 'Demo amaçlı oluşturulmuş kırmızı mermer ürünü. Alevli yüzey.',
      tagline: 'Alevli yüzey',
      seoTitle: 'Demo Rosso Stone — Marble Platform',
      seoDescription: 'Demo kırmızı mermer ürünü.',
    },
    en: {
      name: 'Demo Rosso Stone',
      slug: 'demo-rosso-stone',
      description: 'Demo red marble product. Flamed surface.',
      tagline: 'Flamed surface',
      seoTitle: 'Demo Rosso Stone — Marble Platform',
      seoDescription: 'Demo red marble product.',
    },
    isFeatured: false,
    collections: ['classic-stones', 'architectural-stones'],
    applications: ['residential'],
    relatedTo: ['demo-white'],
  },
  {
    identifier: 'demo-navy',
    mediaFile: '/demo/images/demo-marble-navy.svg',
    mediaWidth: 1200,
    mediaHeight: 900,
    surfaceFinish: 'Sawn',
    dimensions: '600x600mm',
    format: 'Slab',
    origin: 'Kütahya, Turkey',
    tr: {
      name: 'Demo Navy Stone',
      slug: 'demo-navy-stone',
      description: 'Demo amaçlı oluşturulmuş lacivert mermer ürünü. Kesilmiş yüzey.',
      tagline: 'Kesilmiş yüzey',
      seoTitle: 'Demo Navy Stone — Marble Platform',
      seoDescription: 'Demo lacivert mermer ürünü.',
    },
    en: {
      name: 'Demo Navy Stone',
      slug: 'demo-navy-stone',
      description: 'Demo navy marble product. Sawn surface.',
      tagline: 'Sawn surface',
      seoTitle: 'Demo Navy Stone — Marble Platform',
      seoDescription: 'Demo navy marble product.',
    },
    isFeatured: false,
    collections: ['contemporary-stones'],
    applications: ['hospitality'],
    relatedTo: ['demo-charcoal'],
  },
];

const COLLECTIONS: Record<string, SeedCollection> = {
  'classic-stones': {
    mediaFile: '/demo/images/demo-collection-classic.svg',
    tr: {
      name: 'Klasik Taşlar',
      slug: 'klasik-taslar',
      description: 'Klasik mermer ve doğal taş koleksiyonu. Geleneksel dokular ve zamansız tasarım.',
      seoTitle: 'Klasik Taşlar — Marble Platform',
      seoDescription: 'Klasik mermer ve doğal taş koleksiyonu.',
    },
    en: {
      name: 'Classic Stones',
      slug: 'classic-stones',
      description: 'Classic marble and natural stone collection. Traditional textures and timeless design.',
      seoTitle: 'Classic Stones — Marble Platform',
      seoDescription: 'Classic marble and natural stone collection.',
    },
    displayOrder: 1,
  },
  'contemporary-stones': {
    mediaFile: '/demo/images/demo-collection-modern.svg',
    tr: {
      name: 'Çağdaş Taşlar',
      slug: 'cagdas-taslar',
      description: 'Çağdaş tasarım anlayışına yönelik doğal taş koleksiyonu. Modern dokular ve yüzey bitişleri.',
      seoTitle: 'Çağdaş Taşlar — Marble Platform',
      seoDescription: 'Çağdaş doğal taş koleksiyonu.',
    },
    en: {
      name: 'Contemporary Stones',
      slug: 'contemporary-stones',
      description: 'Natural stone collection for contemporary design. Modern textures and surface finishes.',
      seoTitle: 'Contemporary Stones — Marble Platform',
      seoDescription: 'Contemporary natural stone collection.',
    },
    displayOrder: 2,
  },
  'architectural-stones': {
    mediaFile: '/demo/images/demo-collection-luxe.svg',
    tr: {
      name: 'Mimari Taşlar',
      slug: 'mimari-taslar',
      description: 'Mimari projeler için tasarlanmış doğal taş koleksiyonu. Büyük ebat ve özel yüzey seçenekleri.',
      seoTitle: 'Mimari Taşlar — Marble Platform',
      seoDescription: 'Mimari doğal taş koleksiyonu.',
    },
    en: {
      name: 'Architectural Stones',
      slug: 'architectural-stones',
      description: 'Natural stone collection designed for architectural projects. Large format and special surface options.',
      seoTitle: 'Architectural Stones — Marble Platform',
      seoDescription: 'Architectural natural stone collection.',
    },
    displayOrder: 3,
  },
};

const APPLICATIONS: Record<string, SeedApplication> = {
  residential: {
    mediaFile: '/demo/images/demo-app-bathroom.svg',
    tr: {
      name: 'Konut',
      slug: 'konut',
      description: 'Konut projeleri için doğal taş uygulama örnekleri. Mutfak, banyo ve yaşam alanları.',
      seoTitle: 'Konut Uygulamaları — Marble Platform',
      seoDescription: 'Konut projeleri için doğal taş uygulamaları.',
    },
    en: {
      name: 'Residential',
      slug: 'residential',
      description: 'Natural stone application examples for residential projects. Kitchen, bathroom and living spaces.',
      seoTitle: 'Residential Applications — Marble Platform',
      seoDescription: 'Natural stone applications for residential projects.',
    },
    displayOrder: 1,
  },
  hospitality: {
    mediaFile: '/demo/images/demo-app-kitchen.svg',
    tr: {
      name: 'Otel ve Konaklama',
      slug: 'otel-ve-konaklama',
      description: 'Otel ve konaklama projeleri için doğal taş uygulama örnekleri. Lobi, koridor ve süit alanları.',
      seoTitle: 'Otel ve Konaklama — Marble Platform',
      seoDescription: 'Otel ve konaklama projeleri için doğal taş uygulamaları.',
    },
    en: {
      name: 'Hospitality',
      slug: 'hospitality',
      description: 'Natural stone application examples for hotel and hospitality projects. Lobby, corridor and suite areas.',
      seoTitle: 'Hospitality Applications — Marble Platform',
      seoDescription: 'Natural stone applications for hospitality projects.',
    },
    displayOrder: 2,
  },
  commercial: {
    mediaFile: '/demo/images/demo-app-living.svg',
    tr: {
      name: 'Ticari',
      slug: 'ticari',
      description: 'Ticari projeler için doğal taş uygulama örnekleri. Ofis, mağaza ve kamusal alanlar.',
      seoTitle: 'Ticari Uygulamalar — Marble Platform',
      seoDescription: 'Ticari projeler için doğal taş uygulamaları.',
    },
    en: {
      name: 'Commercial',
      slug: 'commercial',
      description: 'Natural stone application examples for commercial projects. Office, retail and public spaces.',
      seoTitle: 'Commercial Applications — Marble Platform',
      seoDescription: 'Natural stone applications for commercial projects.',
    },
    displayOrder: 3,
  },
};

const PROJECTS: SeedProject[] = [
  {
    mediaFile: '/demo/images/demo-project-facade.svg',
    location: 'İstanbul, Turkey',
    projectType: 'Hotel Lobby',
    tr: {
      name: 'Demo Mimari Projesi',
      slug: 'demo-mimari-projesi',
      description: 'Demo amaçlı oluşturulmuş mimari proje. Otel lobi uygulaması.',
      seoTitle: 'Demo Mimari Projesi — Marble Platform',
      seoDescription: 'Demo mimari proje.',
    },
    en: {
      name: 'Demo Architectural Project',
      slug: 'demo-architectural-project',
      description: 'Demo architectural project. Hotel lobby application.',
      seoTitle: 'Demo Architectural Project — Marble Platform',
      seoDescription: 'Demo architectural project.',
    },
    products: ['demo-ivory', 'demo-white'],
    applications: ['hospitality'],
  },
];

const JOURNAL_ARTICLES: SeedJournal[] = [
  {
    mediaFile: '/demo/images/demo-journal-quarry.svg',
    publicationDate: '2026-01-15',
    authorName: 'Marble Platform Team',
    tr: {
      name: 'Doğal Taş Seçimi Hakkında',
      slug: 'dogal-tas-secimi-hakkinda',
      description: 'Doğal taş seçimi sürecinde dikkat edilmesi gereken temel faktörler hakkında makale.',
      seoTitle: 'Doğal Taş Seçimi — Marble Platform',
      seoDescription: 'Doğal taş seçimi hakkında makale.',
    },
    en: {
      name: 'Understanding Natural Stone Selection',
      slug: 'understanding-natural-stone-selection',
      description: 'Article about key factors to consider in the natural stone selection process.',
      seoTitle: 'Natural Stone Selection — Marble Platform',
      seoDescription: 'Article about natural stone selection.',
    },
    referencedProducts: ['demo-ivory', 'demo-green'],
    referencedApplications: ['residential'],
  },
  {
    mediaFile: '/demo/images/demo-collection-modern.svg',
    publicationDate: '2026-03-20',
    authorName: 'Marble Platform Team',
    tr: {
      name: 'Çağdaş Mimarlıkta Taş Kullanımı',
      slug: 'cagdas-mimarlikta-tas-kullanimi',
      description: 'Çağdaş mimari projelerde doğal taş kullanımı trendleri hakkında makale.',
      seoTitle: 'Çağdaş Mimarlıkta Taş — Marble Platform',
      seoDescription: 'Çağdaş mimarlıkta taş kullanımı hakkında makale.',
    },
    en: {
      name: 'Stone in Contemporary Architecture',
      slug: 'stone-in-contemporary-architecture',
      description: 'Article about natural stone usage trends in contemporary architectural projects.',
      seoTitle: 'Stone in Architecture — Marble Platform',
      seoDescription: 'Article about stone in contemporary architecture.',
    },
    referencedProducts: ['demo-charcoal', 'demo-beige'],
    referencedApplications: ['commercial', 'hospitality'],
  },
  {
    mediaFile: '/demo/images/demo-collection-luxe.svg',
    publicationDate: '2026-06-10',
    authorName: 'Marble Platform Team',
    tr: {
      name: 'Ocaktan Bitiş Yüzeyine',
      slug: 'ocaktan-bitis-yuzeyine',
      description: 'Doğal taşın ocaktan çıkarılmasından bitiş yüzeyine kadar olan süreç hakkında makale.',
      seoTitle: 'Ocaktan Bitiş Yüzeyine — Marble Platform',
      seoDescription: 'Ocaktan bitiş yüzeyine kadar süreç hakkında makale.',
    },
    en: {
      name: 'From Quarry Block to Finished Surface',
      slug: 'from-quarry-block-to-finished-surface',
      description: 'Article about the process from quarry extraction to finished surface.',
      seoTitle: 'Quarry to Surface — Marble Platform',
      seoDescription: 'Article about quarry to finished surface process.',
    },
    referencedProducts: ['demo-white', 'demo-rosso'],
    referencedApplications: ['residential', 'commercial'],
  },
];

const COMPANY_CONTENTS: SeedCompanyContent[] = [
  {
    kind: 'ABOUT',
    mediaFile: '/demo/images/demo-collection-classic.svg',
    tr: {
      name: 'Hakkımızda',
      slug: 'hakkimizda',
      description: 'Bu sayfa demo amaçlı oluşturulmuş şirket bilgisi içermektedir.',
      seoTitle: 'Hakkımızda — Marble Platform',
      seoDescription: 'Demo şirket bilgisi.',
    },
    en: {
      name: 'About Us',
      slug: 'about-us',
      description: 'This page contains demo company information.',
      seoTitle: 'About Us — Marble Platform',
      seoDescription: 'Demo company information.',
    },
    referencedProducts: ['demo-ivory', 'demo-white'],
    referencedJournalSlugs: ['dogal-tas-secimi-hakkinda'],
  },
  {
    kind: 'QUARRY',
    mediaFile: '/demo/images/demo-journal-quarry.svg',
    tr: {
      name: 'Ocağımız',
      slug: 'ocagimiz',
      description: 'Bu sayfa demo amaçlı oluşturulmuş ocak bilgisi içermektedir.',
      seoTitle: 'Ocağımız — Marble Platform',
      seoDescription: 'Demo ocak bilgisi.',
    },
    en: {
      name: 'Our Quarry',
      slug: 'our-quarry',
      description: 'This page contains demo quarry information.',
      seoTitle: 'Our Quarry — Marble Platform',
      seoDescription: 'Demo quarry information.',
    },
    referencedProducts: ['demo-ivory', 'demo-green'],
    referencedJournalSlugs: [],
  },
  {
    kind: 'FACTORY',
    mediaFile: '/demo/images/demo-collection-modern.svg',
    tr: {
      name: 'Fabrikamız',
      slug: 'fabrikamiz',
      description: 'Bu sayfa demo amaçlı oluşturulmuş fabrika bilgisi içermektedir.',
      seoTitle: 'Fabrikamız — Marble Platform',
      seoDescription: 'Demo fabrika bilgisi.',
    },
    en: {
      name: 'Our Factory',
      slug: 'our-factory',
      description: 'This page contains demo factory information.',
      seoTitle: 'Our Factory — Marble Platform',
      seoDescription: 'Demo factory information.',
    },
    referencedProducts: ['demo-charcoal', 'demo-beige'],
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

const DEV_ADMIN_EMAIL = 'admin@marble-platform.local';
const DEV_EDITOR_EMAIL = 'editor@marble-platform.local';
const DEV_ADMIN_DEFAULT_PASSWORD = 'Admin123!ChangeMe';

/**
 * Development-only admin/editor logins. Password comes from SEED_ADMIN_PASSWORD;
 * a documented default is used otherwise (dev databases only — never prod).
 */
async function ensureDevAdmin(prisma: PrismaClient) {
  const configured = process.env.SEED_ADMIN_PASSWORD;
  const password = configured && configured.length >= 12 ? configured : DEV_ADMIN_DEFAULT_PASSWORD;
  if (!configured) {
    console.log('[seed] SEED_ADMIN_PASSWORD not set — using documented dev default password.');
  }
  const passwordHash = await hashPassword(password);
  for (const [email, name, roleName] of [
    [DEV_ADMIN_EMAIL, 'Development Admin', 'ADMIN'],
    [DEV_EDITOR_EMAIL, 'Development Editor', 'EDITOR'],
  ] as const) {
    await prisma.internalUser.upsert({
      where: { email },
      update: { passwordHash, isActive: true },
      create: {
        email,
        name,
        isActive: true,
        passwordHash,
        roles: {
          create: {
            role: {
              connectOrCreate: {
                where: { name: roleName },
                create: { name: roleName },
              },
            },
          },
        },
      },
    });
    console.log(`[seed] Dev login ready: ${email} (${roleName})`);
  }
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

async function seedMediaForContentItem(
  tx: Prisma.TransactionClient,
  contentItemId: string,
  mediaFile: string,
  width: number,
  height: number,
  role: 'PRIMARY' | 'HERO' | 'GALLERY',
  trAlt: string,
  enAlt: string
) {
  // Attach the same demo asset to every locale variant so all locales
  // render the full media experience (cards, heroes, galleries).
  const variants = await tx.contentVariant.findMany({
    where: { contentItemId },
  });
  for (const variant of variants) {
    await seedMediaForVariant(
      tx,
      variant.id,
      mediaFile,
      width,
      height,
      role,
      variant.locale === 'en' ? enAlt : trAlt
    );
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
  } else if (existing.altText !== altText) {
    await tx.contentMedia.update({
      where: { id: existing.id },
      data: { altText },
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

  await ensureDevAdmin(prisma);

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

      // Seed media for all locale variants
      await seedMediaForContentItem(
        tx,
        contentItemId,
        product.mediaFile,
        product.mediaWidth,
        product.mediaHeight,
        'PRIMARY',
        `${product.tr.name}`,
        `${product.en.name}`
      );
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

      await seedMediaForContentItem(
        tx,
        contentItemId,
        collection.mediaFile,
        1200,
        600,
        'PRIMARY',
        `${collection.tr.name}`,
        `${collection.en.name}`
      );
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

      await seedMediaForContentItem(
        tx,
        contentItemId,
        app.mediaFile,
        1200,
        600,
        'PRIMARY',
        `${app.tr.name}`,
        `${app.en.name}`
      );
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

      await seedMediaForContentItem(
        tx,
        contentItemId,
        project.mediaFile,
        1200,
        600,
        'HERO',
        `${project.tr.name}`,
        `${project.en.name}`
      );
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

      await seedMediaForContentItem(
        tx,
        contentItemId,
        article.mediaFile,
        800,
        600,
        'PRIMARY',
        `${article.tr.name}`,
        `${article.en.name}`
      );
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

      await seedMediaForContentItem(
        tx,
        contentItemId,
        content.mediaFile,
        1200,
        600,
        'PRIMARY',
        `${content.tr.name}`,
        `${content.en.name}`
      );
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
