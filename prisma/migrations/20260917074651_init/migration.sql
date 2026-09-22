-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('PRODUCT', 'COLLECTION', 'APPLICATION', 'PROJECT', 'JOURNAL_ARTICLE', 'COMPANY_CONTENT');

-- CreateEnum
CREATE TYPE "ContentAggregateState" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED', 'REMOVED');

-- CreateEnum
CREATE TYPE "VariantLifecycle" AS ENUM ('DRAFT', 'APPROVED', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED', 'REMOVED');

-- CreateEnum
CREATE TYPE "CompanyContentKind" AS ENUM ('ABOUT', 'QUARRY', 'FACTORY');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'LOGO');

-- CreateEnum
CREATE TYPE "MediaRightsState" AS ENUM ('UNVERIFIED', 'VERIFIED', 'RESTRICTED');

-- CreateEnum
CREATE TYPE "MediaRole" AS ENUM ('PRIMARY', 'GALLERY', 'HERO', 'PREVIEW', 'THUMBNAIL', 'POSTER');

-- CreateEnum
CREATE TYPE "ApprovalOutcome" AS ENUM ('APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "QuoteRequestState" AS ENUM ('PENDING', 'IN_REVIEW', 'RESPONDED', 'CLOSED');

-- CreateEnum
CREATE TYPE "QuoteRequestContextKind" AS ENUM ('PRODUCT', 'PROJECT', 'APPLICATION');

-- CreateEnum
CREATE TYPE "SeoRobots" AS ENUM ('INDEX', 'NOINDEX', 'FOLLOW', 'NOFOLLOW');

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" UUID NOT NULL,
    "type" "ContentType" NOT NULL,
    "aggregateState" "ContentAggregateState" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVariant" (
    "id" UUID NOT NULL,
    "contentItemId" UUID NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "lifecycleState" "VariantLifecycle" NOT NULL DEFAULT 'DRAFT',
    "slug" VARCHAR(500) NOT NULL,
    "name" VARCHAR(500),
    "description" TEXT,
    "tagline" VARCHAR(500),
    "seoTitle" VARCHAR(500),
    "seoDescription" VARCHAR(500),
    "seoCanonical" VARCHAR(1000),
    "seoRobots" "SeoRobots",
    "displayOrder" INTEGER,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "featuredOrder" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentRevision" (
    "id" UUID NOT NULL,
    "contentVariantId" UUID NOT NULL,
    "authorId" UUID,
    "revisionNumber" INTEGER NOT NULL,
    "materialSnapshot" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentRevision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" UUID NOT NULL,
    "contentRevisionId" UUID NOT NULL,
    "approverId" UUID NOT NULL,
    "outcome" "ApprovalOutcome" NOT NULL,
    "notes" TEXT,
    "coveredLocale" VARCHAR(5) NOT NULL,
    "coveredAssets" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "contentItemId" UUID NOT NULL,
    "internalIdentifier" VARCHAR(100),
    "surfaceFinish" VARCHAR(500),
    "dimensions" VARCHAR(500),
    "format" VARCHAR(500),
    "origin" VARCHAR(500),
    "applicableStandards" VARCHAR(500),

    CONSTRAINT "Product_pkey" PRIMARY KEY ("contentItemId")
);

-- CreateTable
CREATE TABLE "Collection" (
    "contentItemId" UUID NOT NULL,

    CONSTRAINT "Collection_pkey" PRIMARY KEY ("contentItemId")
);

-- CreateTable
CREATE TABLE "Application" (
    "contentItemId" UUID NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("contentItemId")
);

-- CreateTable
CREATE TABLE "Project" (
    "contentItemId" UUID NOT NULL,
    "location" VARCHAR(500),
    "projectType" VARCHAR(200),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("contentItemId")
);

-- CreateTable
CREATE TABLE "JournalArticle" (
    "contentItemId" UUID NOT NULL,
    "publicationDate" TIMESTAMP(3) NOT NULL,
    "authorName" VARCHAR(300),

    CONSTRAINT "JournalArticle_pkey" PRIMARY KEY ("contentItemId")
);

-- CreateTable
CREATE TABLE "CompanyContent" (
    "contentItemId" UUID NOT NULL,
    "kind" "CompanyContentKind" NOT NULL,

    CONSTRAINT "CompanyContent_pkey" PRIMARY KEY ("contentItemId")
);

-- CreateTable
CREATE TABLE "ProductCollection" (
    "productId" UUID NOT NULL,
    "collectionId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductCollection_pkey" PRIMARY KEY ("productId","collectionId")
);

-- CreateTable
CREATE TABLE "ProductApplication" (
    "productId" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductApplication_pkey" PRIMARY KEY ("productId","applicationId")
);

-- CreateTable
CREATE TABLE "ProjectProduct" (
    "projectId" UUID NOT NULL,
    "productId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectProduct_pkey" PRIMARY KEY ("projectId","productId")
);

-- CreateTable
CREATE TABLE "ProjectApplication" (
    "projectId" UUID NOT NULL,
    "applicationId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProjectApplication_pkey" PRIMARY KEY ("projectId","applicationId")
);

-- CreateTable
CREATE TABLE "RelatedProduct" (
    "sourceProductId" UUID NOT NULL,
    "targetProductId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RelatedProduct_pkey" PRIMARY KEY ("sourceProductId","targetProductId")
);

-- CreateTable
CREATE TABLE "JournalContentReference" (
    "id" UUID NOT NULL,
    "journalArticleId" UUID NOT NULL,
    "productProductId" UUID,
    "applicationId" UUID,
    "projectId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalContentReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyContentReference" (
    "id" UUID NOT NULL,
    "companyContentId" UUID NOT NULL,
    "productProductId" UUID,
    "journalArticleId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CompanyContentReference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" UUID NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "sourceReference" VARCHAR(1000) NOT NULL,
    "originalAssetId" UUID,
    "rightsState" "MediaRightsState" NOT NULL DEFAULT 'UNVERIFIED',
    "rightsEvidence" VARCHAR(1000),
    "width" INTEGER,
    "height" INTEGER,
    "aspectRatio" VARCHAR(20),
    "fileType" VARCHAR(100) NOT NULL,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentMedia" (
    "id" UUID NOT NULL,
    "contentVariantId" UUID NOT NULL,
    "mediaAssetId" UUID NOT NULL,
    "role" "MediaRole" NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "altText" VARCHAR(500),
    "caption" VARCHAR(500),
    "focalPointX" DOUBLE PRECISION,
    "focalPointY" DOUBLE PRECISION,

    CONSTRAINT "ContentMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternalUser" (
    "id" UUID NOT NULL,
    "email" VARCHAR(300) NOT NULL,
    "name" VARCHAR(300),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InternalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "roleId" UUID NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditEvent" (
    "id" UUID NOT NULL,
    "actorId" UUID,
    "action" VARCHAR(100) NOT NULL,
    "contentItemId" UUID,
    "variantId" UUID,
    "revisionId" UUID,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequest" (
    "id" UUID NOT NULL,
    "contactName" VARCHAR(300) NOT NULL,
    "contactEmail" VARCHAR(300) NOT NULL,
    "contactPhone" VARCHAR(50),
    "company" VARCHAR(300),
    "message" TEXT NOT NULL,
    "locale" VARCHAR(5) NOT NULL,
    "state" "QuoteRequestState" NOT NULL DEFAULT 'PENDING',
    "processedById" UUID,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "QuoteRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuoteRequestContext" (
    "id" UUID NOT NULL,
    "quoteRequestId" UUID NOT NULL,
    "contextKind" "QuoteRequestContextKind" NOT NULL,
    "productId" UUID,
    "projectId" UUID,
    "applicationId" UUID,

    CONSTRAINT "QuoteRequestContext_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentItem_type_aggregateState_idx" ON "ContentItem"("type", "aggregateState");

-- CreateIndex
CREATE INDEX "ContentVariant_locale_lifecycleState_idx" ON "ContentVariant"("locale", "lifecycleState");

-- CreateIndex
CREATE INDEX "ContentVariant_locale_slug_idx" ON "ContentVariant"("locale", "slug");

-- CreateIndex
CREATE INDEX "ContentVariant_contentItemId_locale_idx" ON "ContentVariant"("contentItemId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVariant_contentItemId_locale_key" ON "ContentVariant"("contentItemId", "locale");

-- CreateIndex
CREATE INDEX "ContentRevision_contentVariantId_revisionNumber_idx" ON "ContentRevision"("contentVariantId", "revisionNumber");

-- CreateIndex
CREATE INDEX "Approval_contentRevisionId_outcome_idx" ON "Approval"("contentRevisionId", "outcome");

-- CreateIndex
CREATE INDEX "Approval_approverId_createdAt_idx" ON "Approval"("approverId", "createdAt");

-- CreateIndex
CREATE INDEX "RelatedProduct_targetProductId_idx" ON "RelatedProduct"("targetProductId");

-- CreateIndex
CREATE INDEX "JournalContentReference_productProductId_idx" ON "JournalContentReference"("productProductId");

-- CreateIndex
CREATE INDEX "JournalContentReference_applicationId_idx" ON "JournalContentReference"("applicationId");

-- CreateIndex
CREATE INDEX "JournalContentReference_projectId_idx" ON "JournalContentReference"("projectId");

-- CreateIndex
CREATE INDEX "CompanyContentReference_productProductId_idx" ON "CompanyContentReference"("productProductId");

-- CreateIndex
CREATE INDEX "CompanyContentReference_journalArticleId_idx" ON "CompanyContentReference"("journalArticleId");

-- CreateIndex
CREATE INDEX "MediaAsset_rightsState_idx" ON "MediaAsset"("rightsState");

-- CreateIndex
CREATE INDEX "ContentMedia_contentVariantId_role_displayOrder_idx" ON "ContentMedia"("contentVariantId", "role", "displayOrder");

-- CreateIndex
CREATE INDEX "ContentMedia_mediaAssetId_idx" ON "ContentMedia"("mediaAssetId");

-- CreateIndex
CREATE UNIQUE INDEX "InternalUser_email_key" ON "InternalUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRole_userId_roleId_key" ON "UserRole"("userId", "roleId");

-- CreateIndex
CREATE INDEX "AuditEvent_contentItemId_createdAt_idx" ON "AuditEvent"("contentItemId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditEvent_actorId_createdAt_idx" ON "AuditEvent"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "QuoteRequest_state_submittedAt_idx" ON "QuoteRequest"("state", "submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "QuoteRequestContext_quoteRequestId_key" ON "QuoteRequestContext"("quoteRequestId");

-- CreateIndex
CREATE INDEX "QuoteRequestContext_productId_idx" ON "QuoteRequestContext"("productId");

-- CreateIndex
CREATE INDEX "QuoteRequestContext_projectId_idx" ON "QuoteRequestContext"("projectId");

-- CreateIndex
CREATE INDEX "QuoteRequestContext_applicationId_idx" ON "QuoteRequestContext"("applicationId");

-- AddForeignKey
ALTER TABLE "ContentVariant" ADD CONSTRAINT "ContentVariant_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_contentVariantId_fkey" FOREIGN KEY ("contentVariantId") REFERENCES "ContentVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentRevision" ADD CONSTRAINT "ContentRevision_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "InternalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_contentRevisionId_fkey" FOREIGN KEY ("contentRevisionId") REFERENCES "ContentRevision"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "InternalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Collection" ADD CONSTRAINT "Collection_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalArticle" ADD CONSTRAINT "JournalArticle_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContent" ADD CONSTRAINT "CompanyContent_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductCollection" ADD CONSTRAINT "ProductCollection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductApplication" ADD CONSTRAINT "ProductApplication_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductApplication" ADD CONSTRAINT "ProductApplication_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProduct" ADD CONSTRAINT "ProjectProduct_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectProduct" ADD CONSTRAINT "ProjectProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectApplication" ADD CONSTRAINT "ProjectApplication_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectApplication" ADD CONSTRAINT "ProjectApplication_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedProduct" ADD CONSTRAINT "RelatedProduct_sourceProductId_fkey" FOREIGN KEY ("sourceProductId") REFERENCES "Product"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RelatedProduct" ADD CONSTRAINT "RelatedProduct_targetProductId_fkey" FOREIGN KEY ("targetProductId") REFERENCES "Product"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalContentReference" ADD CONSTRAINT "JournalContentReference_journalArticleId_fkey" FOREIGN KEY ("journalArticleId") REFERENCES "JournalArticle"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalContentReference" ADD CONSTRAINT "JournalContentReference_productProductId_fkey" FOREIGN KEY ("productProductId") REFERENCES "Product"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalContentReference" ADD CONSTRAINT "JournalContentReference_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalContentReference" ADD CONSTRAINT "JournalContentReference_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContentReference" ADD CONSTRAINT "CompanyContentReference_companyContentId_fkey" FOREIGN KEY ("companyContentId") REFERENCES "CompanyContent"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContentReference" ADD CONSTRAINT "CompanyContentReference_productProductId_fkey" FOREIGN KEY ("productProductId") REFERENCES "Product"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyContentReference" ADD CONSTRAINT "CompanyContentReference_journalArticleId_fkey" FOREIGN KEY ("journalArticleId") REFERENCES "JournalArticle"("contentItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_originalAssetId_fkey" FOREIGN KEY ("originalAssetId") REFERENCES "MediaAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentMedia" ADD CONSTRAINT "ContentMedia_contentVariantId_fkey" FOREIGN KEY ("contentVariantId") REFERENCES "ContentVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContentMedia" ADD CONSTRAINT "ContentMedia_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "InternalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "InternalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditEvent" ADD CONSTRAINT "AuditEvent_contentItemId_fkey" FOREIGN KEY ("contentItemId") REFERENCES "ContentItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequest" ADD CONSTRAINT "QuoteRequest_processedById_fkey" FOREIGN KEY ("processedById") REFERENCES "InternalUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequestContext" ADD CONSTRAINT "QuoteRequestContext_quoteRequestId_fkey" FOREIGN KEY ("quoteRequestId") REFERENCES "QuoteRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequestContext" ADD CONSTRAINT "QuoteRequestContext_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("contentItemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequestContext" ADD CONSTRAINT "QuoteRequestContext_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("contentItemId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuoteRequestContext" ADD CONSTRAINT "QuoteRequestContext_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("contentItemId") ON DELETE SET NULL ON UPDATE CASCADE;
