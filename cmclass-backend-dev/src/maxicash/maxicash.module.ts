import { Module } from '@nestjs/common';
import { MaxicashService } from './maxicash.service';
import { MaxicashController } from './maxicash.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
    imports: [PrismaModule, NotificationModule],
    providers: [MaxicashService],
    controllers: [MaxicashController],
    exports: [MaxicashService],
})
export class MaxicashModule { }
