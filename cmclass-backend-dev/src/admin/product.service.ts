import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

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
    const slug = dto.slug || this.slugify(dto.name);
    const data: any = { ...dto, slug };
    // ensure category exists
    const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
    if (!cat) throw new BadRequestException('Invalid category');
    const p = await this.prisma.product.create({ data });
    return p;
  }

  async update(id: number, dto: UpdateProductDto) {
    const data: any = { ...dto };
    if (dto.name && !dto.slug) data.slug = this.slugify(dto.name);
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
