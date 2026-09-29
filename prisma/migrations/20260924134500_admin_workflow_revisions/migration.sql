-- CreateEnum
CREATE TYPE "RevisionStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED');

-- DropIndex
DROP INDEX "ContentRevision_contentVariantId_revisionNumber_idx";

-- AlterTable
ALTER TABLE "ContentRevision" ADD COLUMN     "status" "RevisionStatus" NOT NULL DEFAULT 'DRAFT';

-- CreateIndex
CREATE INDEX "ContentRevision_contentVariantId_status_idx" ON "ContentRevision"("contentVariantId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ContentRevision_contentVariantId_revisionNumber_key" ON "ContentRevision"("contentVariantId", "revisionNumber");

-- Backfill: all pre-workflow revisions belong to PUBLISHED variants
-- (verified: zero non-PUBLISHED variants), so they represent published content.
UPDATE "ContentRevision" SET "status" = 'PUBLISHED';

