import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CampaignsController],
})
export class PublicModule {}
