import { Controller, Get, Param, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('categories')
export class PublicCategoryController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list() {
    // Get top-level categories with nested children (2 levels)
    const cats = await this.prisma.category.findMany({
      where: { parentId: null, active: true },
      orderBy: { order: 'asc' },
      include: { children: { where: { active: true }, orderBy: { order: 'asc' }, include: { children: { where: { active: true }, orderBy: { order: 'asc' } } } } },
    });

    const mainCategories = cats.map((c) => ({
      title: c.name,
      slug: c.slug,
      link: `/${c.slug || c.name.toLowerCase().replace(/\s+/g, '-')}`,
      imageUrl: c.imageUrl || null,
      description: c.description || null,
      subcategories: c.children.map((ch) => ({
        id: ch.id,
        name: ch.name,
        slug: ch.slug,
        link: `/${ch.slug || ch.name.toLowerCase().replace(/\s+/g, '-')}`,
        imageUrl: ch.imageUrl || null,
        description: ch.description || null,
        children: ch.children?.map((g) => ({ 
          id: g.id, 
          name: g.name, 
          slug: g.slug, 
          link: `/${g.slug || g.name.toLowerCase().replace(/\s+/g, '-')}`,
          imageUrl: g.imageUrl || null,
          description: g.description || null,
        })) || [],
      })),
    }));

    // Build heroContent map for all categories (top-level + children)
    const ASSET_BASE =
  process.env.PUBLIC_ASSET_URL || 'http://localhost:3000';

const heroContent: Record<
  string,
  { img: string | null; title: string; text: string | null }
> = {};

for (const c of cats) {
  if (c.slug) {
    heroContent[c.slug] = {
      img: c.imageUrl ? `${ASSET_BASE}${c.imageUrl}` : null,
      title: c.name,
      text: c.description,
    };
  }

  for (const ch of c.children || []) {
    if (ch.slug) {
      heroContent[ch.slug] = {
        img: ch.imageUrl ? `${ASSET_BASE}${ch.imageUrl}` : null,
        title: ch.name,
        text: ch.description,
      };
    }

    for (const g of ch.children || []) {
      if (g.slug) {
        heroContent[g.slug] = {
          img: g.imageUrl ? `${ASSET_BASE}${g.imageUrl}` : null,
          title: g.name,
          text: g.description,
        };
      }
    }
  }
}


    return { mainCategories, heroContent };
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    // Validate and parse ID
    const parsedId = parseInt(id, 10);
    if (isNaN(parsedId) || parsedId <= 0) {
      throw new BadRequestException('Invalid category ID. Must be a valid positive integer.');
    }

    const category = await this.prisma.category.findUnique({
      where: { id: parsedId },
      include: {
        products: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${parsedId} not found`);
    }

    // Return category with metadata
    return {
      data: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
        active: category.active,
        parentId: category.parentId,
        productCount: category.products?.length || 0,
        products: category.products || [],
      },
    };
  }
}
