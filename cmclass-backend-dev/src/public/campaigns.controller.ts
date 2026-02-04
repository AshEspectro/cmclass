import { Controller, Get, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('campaigns')
export class CampaignsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list() {
    const campaigns = await this.prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { data: campaigns };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    // Validate and parse ID
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid campaign ID. Must be a valid integer.');
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: parsedId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${parsedId} not found`);
    }

    return { data: campaign };
  }

  @Get(':id/catalog')
  async getCatalog(@Param('id') id: string) {
    // Validate and parse ID
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid campaign ID. Must be a valid integer.');
    }

    // Get campaign to verify it exists and get selectedProductIds
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: parsedId },
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${parsedId} not found`);
    }

    // Fetch products that match the campaign's selectedProductIds
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: campaign.selectedProductIds,
        },
      },
      take: 4,
    });

    return { data: products, campaign };
  }
}
