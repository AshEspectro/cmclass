-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketingOptIn" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketingSms" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "marketingTargetedAds" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneCountryCode" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "title" TEXT;

-- CreateTable
CREATE TABLE "AboutPage" (
    "id" SERIAL NOT NULL,
    "heroTitle" TEXT NOT NULL,
    "heroImageUrl" TEXT,
    "visionTitle" TEXT NOT NULL,
    "visionParagraphs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "craftTitle" TEXT NOT NULL,
    "craftParagraphs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "craftImageUrl" TEXT,
    "valuesTitle" TEXT NOT NULL,
    "values" JSONB NOT NULL,
    "ctaTitle" TEXT NOT NULL,
    "ctaDescription" TEXT,
    "ctaButtonText" TEXT NOT NULL,
    "ctaButtonUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AboutPage_pkey" PRIMARY KEY ("id")
);
