import { Module } from '@nestjs/common';
import { MaxicashService } from './maxicash.service';
import { MaxicashController } from './maxicash.controller';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
    providers: [MaxicashService, NotificationService, PrismaService],
    controllers: [MaxicashController],
    exports: [MaxicashService],
})
export class MaxicashModule { }
