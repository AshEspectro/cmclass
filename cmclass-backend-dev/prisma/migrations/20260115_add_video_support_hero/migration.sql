-- AlterTable
ALTER TABLE "HeroSection" ADD COLUMN "backgroundVideoUrl" TEXT,
ADD COLUMN "mediaType" TEXT NOT NULL DEFAULT 'image';
