import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FooterService {
  constructor(private prisma: PrismaService) {}

  async listPublic() {
    return this.prisma.footerSection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        links: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async listAll() {
    return this.prisma.footerSection.findMany({
      orderBy: { order: 'asc' },
      include: {
        links: {
          orderBy: { order: 'asc' },
        },
      },
    });
  }

  async createSection(data: { title: string; order?: number; isActive?: boolean }) {
    return this.prisma.footerSection.create({
      data: {
        title: data.title,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateSection(id: number, data: { title?: string; order?: number; isActive?: boolean }) {
    return this.prisma.footerSection.update({
      where: { id },
      data,
    });
  }

  async deleteSection(id: number) {
    await this.prisma.footerSection.delete({ where: { id } });
  }

  async createLink(
    sectionId: number,
    data: { label: string; url: string; order?: number; isActive?: boolean },
  ) {
    return this.prisma.footerLink.create({
      data: {
        sectionId,
        label: data.label,
        url: data.url,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });
  }

  async updateLink(
    id: number,
    data: { label?: string; url?: string; order?: number; isActive?: boolean },
  ) {
    return this.prisma.footerLink.update({
      where: { id },
      data,
    });
  }

  async deleteLink(id: number) {
    await this.prisma.footerLink.delete({ where: { id } });
  }
}
