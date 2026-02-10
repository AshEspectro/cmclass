import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) { }

  async list({ page = 1, pageSize = 20, search = '', categoryId }: any = {}) {
    const where: any = {};
    if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
    if (categoryId) where.categoryId = Number(categoryId);

    const total = await this.prisma.product.count({ where });
    const data = await this.prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize, include: { category: true } });
    return { data, meta: { total, page, pageSize } };
  }

  async get(id: number) {
    const p = await this.prisma.product.findUnique({ where: { id }, include: { category: true } });
    if (!p) throw new BadRequestException('Product not found');
    return p;
  }

  async create(dto: CreateProductDto) {
    if (!dto.name) throw new BadRequestException('Product name is required');
    if (!dto.categoryId) throw new BadRequestException('Category is required');

    const slug = dto.slug || this.slugify(dto.name);

    // Ensure category exists
    const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!cat) throw new BadRequestException('Invalid category');

    // Only include valid fields from schema
    const data: any = {
      name: dto.name,
      slug,
      category: { connect: { id: dto.categoryId } },
      description: dto.description,
      productImage: dto.productImage,
      label: dto.label,
      images: dto.images || [],
      inStock: dto.inStock !== undefined ? dto.inStock : true,
      longDescription: dto.longDescription,
      mannequinImage: dto.mannequinImage || '',
      colors: dto.colors || [],
      sizes: dto.sizes || [],
      priceCents: dto.priceCents || 0,
      stock: dto.stock || 0,
      careInstructions: dto.careInstructions,
      environmentalInfo: dto.environmentalInfo,
    };

    console.log('Creating product with data:', JSON.stringify(data, null, 2));

    try {
      const p = await this.prisma.product.create({ data });
      return p;
    } catch (error: any) {
      console.error('Error creating product:', error);
      throw new BadRequestException(error?.message || 'Failed to create product');
    }
  }

  async update(id: number, dto: UpdateProductDto) {
    // Check if product exists
    const exists = await this.prisma.product.findUnique({ where: { id } });
    if (!exists) throw new BadRequestException('Product not found');

    // Only include fields that are provided
    const data: any = {};

    if (dto.name !== undefined) data.name = dto.name;
    if (dto.slug !== undefined) data.slug = dto.slug;
    else if (dto.name) data.slug = this.slugify(dto.name);

    if (dto.description !== undefined) data.description = dto.description;
    if (dto.productImage !== undefined) data.productImage = dto.productImage;
    if (dto.label !== undefined) data.label = dto.label;
    if (dto.images !== undefined) data.images = dto.images;
    if (dto.inStock !== undefined) data.inStock = dto.inStock;
    if (dto.longDescription !== undefined) data.longDescription = dto.longDescription;
    if (dto.mannequinImage !== undefined) data.mannequinImage = dto.mannequinImage;
    if (dto.colors !== undefined) data.colors = dto.colors;
    if (dto.sizes !== undefined) data.sizes = dto.sizes;
    if (dto.priceCents !== undefined) data.priceCents = dto.priceCents;
    if (dto.stock !== undefined) data.stock = dto.stock;
    if (dto.careInstructions !== undefined) data.careInstructions = dto.careInstructions;
    if (dto.environmentalInfo !== undefined) data.environmentalInfo = dto.environmentalInfo;

    if (dto.categoryId !== undefined) {
      const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
      if (!cat) throw new BadRequestException('Invalid category');
      data.category = { connect: { id: dto.categoryId } };
    }

    const p = await this.prisma.product.update({ where: { id }, data });
    return p;
  }

  async delete(id: number) {
    await this.prisma.product.delete({ where: { id } });
    return { success: true };
  }

  private slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
}
