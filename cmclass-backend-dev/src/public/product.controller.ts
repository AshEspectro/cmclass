import { Controller, Get, Query, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('products')
export class PublicProductController {
  constructor(private readonly prisma: PrismaService) { }

  private getUrl(url: string | null) {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    // Prefer VITE_API_URL or PUBLIC_ASSET_URL for production
    const base = process.env.VITE_API_URL || process.env.PUBLIC_ASSET_URL || `http://localhost:${process.env.PORT || 3000}`;

    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('categoryId') categoryId?: string,
    @Query('search') search = ''
  ) {
    const where: any = { status: 'ACTIVE' };
    if (categoryId) {
      const parsedCategoryId = Number(categoryId);
      if (isNaN(parsedCategoryId) || parsedCategoryId <= 0) {
        return { data: [], meta: { total: 0, page: Number(page), pageSize: Number(pageSize), error: 'Invalid categoryId' } };
      }
      where.categoryId = parsedCategoryId;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const total = await this.prisma.product.count({ where });
    const products = await this.prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(pageSize),
      include: { category: true },
    });

    // Transform to match frontend Product_cat interface
    const data = products.map((p) => {
      // Parse colors if stored as JSON string
      let parsedColors = [];
      try {
        parsedColors = p.colors ? (Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors as any)) : [];
      } catch (e) {
        console.error(`Error parsing colors for product ${p.id}`, e);
        parsedColors = [];
      }

      return {
        id: p.id,
        label: p.label || null,
        name: p.name,
        price: p.priceCents ? p.priceCents / 100 : 0,
        sizes: p.sizes || [],
        longDescription: p.longDescription || null,
        productImage: this.getUrl(p.productImage),
        mannequinImage: this.getUrl(p.mannequinImage),
        colors: parsedColors,
        images: (p.images || []).map(img => this.getUrl(img)),
        inStock: p.inStock,
        categoryId: p.categoryId,
        category: p.category?.name || null,
      };
    });

    return { data, meta: { total, page: Number(page), pageSize: Number(pageSize) } };
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    });

    if (!product) {
      return { error: 'Product not found' };
    }

    // Parse colors
    let parsedColors = [];
    try {
      parsedColors = product.colors ? (Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors as any)) : [];
    } catch (e) {
      console.error(`Error parsing colors for product ${product.id}`, e);
      parsedColors = [];
    }

    // Transform to match frontend Product_cat interface
    const data = {
      id: product.id,
      label: product.label || null,
      name: product.name,
      price: product.priceCents ? product.priceCents / 100 : 0,
      sizes: product.sizes || [],
      longDescription: product.longDescription || null,
      productImage: this.getUrl(product.productImage),
      mannequinImage: this.getUrl(product.mannequinImage),
      colors: parsedColors,
      images: (product.images || []).map(img => this.getUrl(img)),
      inStock: product.inStock,
      categoryId: product.categoryId,
      category: product.category?.name || null,
      description: product.description || null,
    };

    return { data };
  }

  @Get('category/:categorySlug')
  async getByCategory(@Param('categorySlug') slug: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return { data: [] };
    }

    const products = await this.prisma.product.findMany({
      where: { categoryId: category.id, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });

    const data = products.map((p) => {
      // Parse colors
      let parsedColors = [];
      try {
        parsedColors = p.colors ? (Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors as any)) : [];
      } catch (e) {
        console.error(`Error parsing colors for product ${p.id}`, e);
        parsedColors = [];
      }

      return {
        id: p.id,
        label: p.label || null,
        name: p.name,
        price: p.priceCents ? p.priceCents / 100 : 0,
        sizes: p.sizes || [],
        longDescription: p.longDescription || null,
        productImage: this.getUrl(p.productImage),
        mannequinImage: this.getUrl(p.mannequinImage),
        colors: parsedColors,
        images: (p.images || []).map(img => this.getUrl(img)),
        inStock: p.inStock,
        categoryId: p.categoryId,
        category: category.name,
      };
    });

    return { data };
  }
}
