import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { CartModule } from './cart/cart.module';
import { WishlistModule } from './wishlist/wishlist.module';

import { PublicBrandController } from './public/brand.controller';
import { PublicCategoryController } from './public/category.controller';
import { PublicHeroController } from './public/hero.controller';
import { PublicProductController } from './public/product.controller';
import { CampaignsController } from './public/campaigns.controller';
import { PublicServicesController } from './public/services.controller';
import { PublicAboutController } from './public/about.controller';
import { PublicContactController } from './public/contact.controller';
import { OrdersModule } from './orders/orders.module';
import { PublicFooterController } from './public/footer.controller';
import { FooterService } from './footer/footer.service';

@Module({
  imports: [PrismaModule, AuthModule, AdminModule, UsersModule, CartModule, WishlistModule, OrdersModule],
  controllers: [PublicBrandController, PublicCategoryController, PublicHeroController, PublicProductController, CampaignsController, PublicServicesController, PublicAboutController, PublicContactController, PublicFooterController],
  providers: [FooterService],
})
export class AppModule { }
