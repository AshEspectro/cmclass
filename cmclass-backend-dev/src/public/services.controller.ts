import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('services')
export class PublicServicesController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list() {
    const services = await this.prisma.service.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } });
    return { data: services };
  }
}
