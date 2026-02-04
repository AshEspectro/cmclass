-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "genreText" TEXT,
    "imageUrl" TEXT,
    "buttonText" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Brouillon',
    "selectedCategories" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "selectedProductIds" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);
