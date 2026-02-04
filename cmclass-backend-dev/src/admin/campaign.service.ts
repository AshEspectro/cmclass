import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CampaignService {
  constructor(private prisma: PrismaService) {}

  async list() {
    return await this.prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async get(id: number) {
    return await this.prisma.campaign.findUnique({
      where: { id },
    });
  }

  async create(data: {
    title: string;
    genreText?: string;
    imageUrl?: string;
    buttonText?: string;
    selectedCategories?: number[];
    selectedProductIds?: number[];
    status?: string;
  }) {
    return await this.prisma.campaign.create({
      data: {
        title: data.title,
        genreText: data.genreText,
        imageUrl: data.imageUrl,
        buttonText: data.buttonText,
        selectedCategories: data.selectedCategories || [],
        selectedProductIds: data.selectedProductIds || [],
        status: data.status || 'Brouillon',
      },
    });
  }

  async update(id: number, data: any) {
    return await this.prisma.campaign.update({
      where: { id },
      data,
    });
  }

  async delete(id: number) {
    return await this.prisma.campaign.delete({
      where: { id },
    });
  }
}
