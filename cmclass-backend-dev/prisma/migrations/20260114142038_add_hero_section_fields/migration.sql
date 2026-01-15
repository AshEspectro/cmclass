-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "heroCollectionName" TEXT DEFAULT 'Explorez notre collection raffinée d''élégance intemporelle',
ADD COLUMN     "heroCtaText" TEXT DEFAULT 'Découvrir',
ADD COLUMN     "heroCtaUrl" TEXT DEFAULT '/collections/nouveautes',
ADD COLUMN     "heroImageUrl" TEXT,
ADD COLUMN     "heroMainText" TEXT DEFAULT 'Découvrez l''Essence du Luxe';
