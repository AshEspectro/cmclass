/*
  Warnings:

  - You are about to drop the `Hero` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Hero";

-- CreateTable
CREATE TABLE "HeroSection" (
    "id" SERIAL NOT NULL,
    "mainText" TEXT NOT NULL DEFAULT 'Découvrez l''Essence du Luxe',
    "subtext" TEXT NOT NULL DEFAULT 'Explorez notre collection raffinée d''élégance intemporelle',
    "backgroundImageUrl" TEXT,
    "ctaButtonText" TEXT NOT NULL DEFAULT 'Découvrir',
    "ctaButtonUrl" TEXT NOT NULL DEFAULT '/collections/nouveautes',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSection_pkey" PRIMARY KEY ("id")
);
