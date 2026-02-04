import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ServiceService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return await this.prisma.service.findMany({ orderBy: { order: 'asc' } });
  }

  async get(id: number) {
    return await this.prisma.service.findUnique({ where: { id } });
  }

  async create(data: {
    title: string;
    description?: string;
    imageUrl?: string;
    link?: string;
    order?: number;
    isActive?: boolean;
  }) {
    return await this.prisma.service.create({ data: {
      title: data.title,
      description: data.description,
      imageUrl: data.imageUrl,
      link: data.link,
      order: data.order || 0,
      isActive: data.isActive ?? true,
    } });
  }

  async update(id: number, data: any) {
    return await this.prisma.service.update({ where: { id }, data });
  }

  async delete(id: number) {
    return await this.prisma.service.delete({ where: { id } });
  }
}
