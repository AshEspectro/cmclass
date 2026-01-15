import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  heroSection: any;
  async onModuleInit() {
    try {
      await this.$connect();
      // simple smoke-test query to verify connection
      await this.$queryRaw`SELECT 1`;
      console.log('PrismaService: connected to database');
    } catch (e) {
      console.error('PrismaService: connection error', e);
      throw e;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  // explicit method to programmatically verify connection
  async testConnection() {
    const result: any = await this.$queryRaw`SELECT 1 as result`;
    return result;
  }
}
