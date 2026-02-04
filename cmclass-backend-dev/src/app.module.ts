import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';

import { PublicBrandController } from './public/brand.controller';
import { PublicCategoryController } from './public/category.controller';
import { PublicHeroController } from './public/hero.controller';
import { PublicProductController } from './public/product.controller';
import { CampaignsController } from './public/campaigns.controller';
import { PublicServicesController } from './public/services.controller';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule],
  controllers: [PublicBrandController, PublicCategoryController, PublicHeroController, PublicProductController, CampaignsController, PublicServicesController],
})
export class AppModule {}
