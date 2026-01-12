import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';

import { PublicBrandController } from './public/brand.controller';
import { PublicCategoryController } from './public/category.controller';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule],
  controllers: [PublicBrandController, PublicCategoryController],
})
export class AppModule {}
