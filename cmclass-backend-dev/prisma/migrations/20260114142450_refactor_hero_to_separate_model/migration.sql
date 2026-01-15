/*
  Warnings:

  - You are about to drop the column `heroCollectionName` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `heroCtaText` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `heroCtaUrl` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `heroImageUrl` on the `Brand` table. All the data in the column will be lost.
  - You are about to drop the column `heroMainText` on the `Brand` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Brand" DROP COLUMN "heroCollectionName",
DROP COLUMN "heroCtaText",
DROP COLUMN "heroCtaUrl",
DROP COLUMN "heroImageUrl",
DROP COLUMN "heroMainText";

-- CreateTable
CREATE TABLE "Hero" (
    "id" SERIAL NOT NULL,
    "mainText" TEXT NOT NULL DEFAULT 'Découvrez l''Essence du Luxe',
    "collectionName" TEXT NOT NULL DEFAULT 'Explorez notre collection raffinée d''élégance intemporelle',
    "mediaUrl" TEXT,
    "mediaType" TEXT NOT NULL DEFAULT 'image',
    "ctaText" TEXT NOT NULL DEFAULT 'Découvrir',
    "ctaUrl" TEXT NOT NULL DEFAULT '/collections/nouveautes',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hero_pkey" PRIMARY KEY ("id")
);
