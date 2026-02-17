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
import { MailReceiverService } from './mail/mail-receiver.service';
import { LegalModule } from './legal/legal.module';
import { PublicLegalController } from './public/legal.controller';
import { MaxicashModule } from './maxicash/maxicash.module';
import { NotificationModule } from './notification/notification.module';
import { HealthController } from './health.controller';



@Module({
  imports: [PrismaModule, AuthModule, AdminModule, UsersModule, CartModule, WishlistModule, OrdersModule, LegalModule, MaxicashModule, NotificationModule],
  controllers: [HealthController, PublicBrandController, PublicCategoryController, PublicHeroController, PublicProductController, CampaignsController, PublicServicesController, PublicAboutController, PublicContactController, PublicFooterController, PublicLegalController],
  providers: [FooterService, MailReceiverService],
})
export class AppModule { }
