/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `sizes` on the `Product` table. All the data in the column will be lost.
  - Added the required column `mannequinImage` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `colors` on the `Product` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "imageUrl",
DROP COLUMN "sizes",
ADD COLUMN     "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "label" TEXT,
ADD COLUMN     "longDescription" TEXT,
ADD COLUMN     "mannequinImage" TEXT NOT NULL,
ADD COLUMN     "productImage" TEXT,
DROP COLUMN "colors",
ADD COLUMN     "colors" JSONB NOT NULL;
