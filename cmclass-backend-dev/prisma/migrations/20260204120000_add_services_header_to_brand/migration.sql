-- Migration: add_services_header_to_brand
-- Adds servicesHeaderTitle and servicesHeaderDescription to Brand model

ALTER TABLE "Brand"
ADD COLUMN IF NOT EXISTS "servicesHeaderTitle" TEXT;

ALTER TABLE "Brand"
ADD COLUMN IF NOT EXISTS "servicesHeaderDescription" TEXT;
