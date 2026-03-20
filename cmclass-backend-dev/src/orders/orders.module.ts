import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { OrdersExpiryCron } from './orders-expiry.cron';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';
import { WhatsappModule } from '../whatsapp/whatsapp.module';

@Module({
  imports: [PrismaModule, NotificationModule, WhatsappModule],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersExpiryCron],
  exports: [OrdersService],
})
export class OrdersModule {}
