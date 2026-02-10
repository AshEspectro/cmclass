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

  @Get(':id/categories')
  async getCategories(@Param('id') id: string) {
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId)) {
      throw new BadRequestException('Invalid campaign ID. Must be a valid integer.');
    }

    const campaign = await this.prisma.campaign.findUnique({ where: { id: parsedId } });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${parsedId} not found`);
    }

    // Fetch selected categories and return summary fields + product counts
    const categories = await this.prisma.category.findMany({
      where: { id: { in: campaign.selectedCategories }, active: true },
      select: {
        id: true,
        name: true,
        imageUrl: true,
        description: true,
        order: true,
      },
      orderBy: { order: 'asc' },
    });

    // Count active products per category
    const counts = await Promise.all(
      categories.map((c) =>
        this.prisma.product.count({ where: { categoryId: c.id, status: 'ACTIVE' } }),
      ),
    );

    const result = categories.map((c, idx) => ({
      id: c.id,
      name: c.name,
      imageUrl: c.imageUrl || null,
      description: c.description || null,
      productCount: counts[idx] ?? 0,
    }));

    return { data: result, campaign };
  }

  @Get(':id/categories/:catId')
  async getCategoryDetail(@Param('id') id: string, @Param('catId') catId: string) {
    const parsedCampaignId = parseInt(id, 10);
    const parsedIndex = parseInt(catId, 10); // position in campaign.selectedCategories (1-based)
    if (isNaN(parsedCampaignId) || isNaN(parsedIndex)) {
      throw new BadRequestException('Invalid ID. Must be valid integers.');
    }

    const campaign = await this.prisma.campaign.findUnique({ where: { id: parsedCampaignId } });
    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${parsedCampaignId} not found`);
    }

    // Convert 1-based position to zero-based index
    const position = parsedIndex - 1;
    if (position < 0 || position >= (campaign.selectedCategories?.length || 0)) {
      throw new NotFoundException(`Category position ${parsedIndex} is out of range for campaign ${parsedCampaignId}`);
    }

    const categoryId = campaign.selectedCategories[position];

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    return { data: category, campaign };
  }
}
