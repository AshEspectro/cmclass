import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AuthModule } from '../auth/auth.module';
import { UsersController } from './users.controller';
import { MailService } from '../mail/mail.service';
import { AuditController } from './audit.controller';
import { SignupRequestsController } from './signup-requests.controller';
import { BrandController } from './brand.controller';
import { BrandService } from '../brand/brand.service';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [AdminController, UsersController, AuditController, SignupRequestsController, BrandController, CategoryController, ProductController],
  providers: [MailService, BrandService, CategoryService, ProductService],
  exports: [BrandService, CategoryService, ProductService],
})
export class AdminModule {}
