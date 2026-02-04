import { Controller, Get, Query, Param } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('products')
export class PublicProductController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('categoryId') categoryId?: string,
    @Query('search') search = ''
  ) {
    const ASSET_BASE = process.env.PUBLIC_ASSET_URL || 'http://localhost:3000';
    
    const where: any = { status: 'ACTIVE' };
    if (categoryId) where.categoryId = Number(categoryId);
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
    const data = products.map((p) => ({
      id: p.id,
      label: p.label || null,
      name: p.name,
      price: p.priceCents ? `${(p.priceCents / 100).toFixed(2)}$` : '0.00$',
      sizes: [], // Add sizes if needed
      longDescription: p.longDescription || null,
      productImage: p.productImage ? `${ASSET_BASE}${p.productImage}` : null,
      mannequinImage: p.mannequinImage ? `${ASSET_BASE}${p.mannequinImage}` : null,
      colors: p.colors ? (Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors as any)) : [],
      images: p.images?.map((img) => `${ASSET_BASE}${img}`) || [],
      inStock: p.inStock,
      categoryId: p.categoryId,
      category: p.category?.name || null,
    }));

    return { data, meta: { total, page: Number(page), pageSize: Number(pageSize) } };
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    const ASSET_BASE = process.env.PUBLIC_ASSET_URL || 'http://localhost:3000';
    
    const product = await this.prisma.product.findUnique({
      where: { id: Number(id) },
      include: { category: true },
    });

    if (!product) {
      return { error: 'Product not found' };
    }

    // Transform to match frontend Product_cat interface
    const data = {
      id: product.id,
      label: product.label || null,
      name: product.name,
      price: product.priceCents ? `${(product.priceCents / 100).toFixed(2)}$` : '0.00$',
      sizes: [], // Add sizes if needed
      longDescription: product.longDescription || null,
      productImage: product.productImage ? `${ASSET_BASE}${product.productImage}` : null,
      mannequinImage: product.mannequinImage ? `${ASSET_BASE}${product.mannequinImage}` : null,
      colors: product.colors ? (Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors as any)) : [],
      images: product.images?.map((img) => `${ASSET_BASE}${img}`) || [],
      inStock: product.inStock,
      categoryId: product.categoryId,
      category: product.category?.name || null,
      description: product.description || null,
    };

    return { data };
  }

  @Get('category/:categorySlug')
  async getByCategory(@Param('categorySlug') slug: string) {
    const ASSET_BASE = process.env.PUBLIC_ASSET_URL || 'http://localhost:3000';
    
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

    const data = products.map((p) => ({
      id: p.id,
      label: p.label || null,
      name: p.name,
      price: p.priceCents ? `${(p.priceCents / 100).toFixed(2)}$` : '0.00$',
      sizes: [],
      longDescription: p.longDescription || null,
      productImage: p.productImage ? `${ASSET_BASE}${p.productImage}` : null,
      mannequinImage: p.mannequinImage ? `${ASSET_BASE}${p.mannequinImage}` : null,
      colors: p.colors ? (Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors as any)) : [],
      images: p.images?.map((img) => `${ASSET_BASE}${img}`) || [],
      inStock: p.inStock,
      categoryId: p.categoryId,
      category: category.name,
    }));

    return { data };
  }
}
