import { Controller, Get } from '@nestjs/common';
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
      subcategories: c.children.map((ch) => ({
        id: ch.id,
        name: ch.name,
        slug: ch.slug,
        link: `/${ch.slug || ch.name.toLowerCase().replace(/\s+/g, '-')}`,
        children: ch.children?.map((g) => ({ id: g.id, name: g.name, slug: g.slug, link: `/${g.slug || g.name.toLowerCase().replace(/\s+/g, '-')}` })) || [],
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
}
