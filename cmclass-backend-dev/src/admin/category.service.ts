import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MergeCategoriesDto } from './dto/merge-categories.dto';

@Injectable()
export class CategoryService {
  constructor(private prisma: PrismaService) {}

  async list({ page = 1, pageSize = 20, search = '', includeInactive = true }: any = {}) {
    const where: any = {};
    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }, { slug: { contains: search, mode: 'insensitive' } }];
    }
    if (!includeInactive) where.active = true;

    const total = await this.prisma.category.count({ where });
    const data = await this.prisma.category.findMany({ where, orderBy: { order: 'asc' }, skip: (page - 1) * pageSize, take: pageSize, include: { _count: { select: { products: true } } } });
    return { data, meta: { total, page, pageSize } };
  }

  async get(id: number) {
    const cat = await this.prisma.category.findUnique({ where: { id }, include: { children: true } });
    if (!cat) throw new BadRequestException('Category not found');
    return cat;
  }

  async create(dto: CreateCategoryDto) {
    const desiredSlug = dto.slug || this.slugify(dto.name);
    const data: any = { ...dto };
    
    // If parentId is provided, generate hierarchical slug
    let finalSlug = desiredSlug;
    if (dto.parentId) {
      finalSlug = await this.makeSubcategorySlug(dto.parentId, dto.name);
    } else {
      // For top-level categories, ensure slug uniqueness
      finalSlug = await this.makeUniqueSlug(finalSlug || this.slugify(dto.name || 'category'));
    }

    // Prepare nested children create if provided
    let childrenCreate: any[] | undefined = undefined;
    if (dto.subcategories && dto.subcategories.length > 0) {
      childrenCreate = dto.subcategories.map((sub) => ({
        name: sub.name,
        slug: sub.slug || this.slugify(sub.name),
        description: sub.description || null,
        imageUrl: sub.imageUrl || null,
        order: typeof sub.order === 'number' ? sub.order : undefined,
      }));
    }

    // Track assigned slugs within this request to avoid sibling collisions
    const assignedSlugs = new Set<string>();
    assignedSlugs.add(finalSlug);

    const normalizedChildren = [] as any[];
    if (childrenCreate) {
      for (const ch of childrenCreate) {
        const base = this.slugify(ch.slug || ch.name || 'sub');
        let candidate = base;
        let i = 1;
        // avoid collisions with assigned slugs or existing DB slugs
        while (assignedSlugs.has(candidate) || (await this.prisma.category.findUnique({ where: { slug: candidate } }))) {
          candidate = `${base}-${i++}`;
        }
        assignedSlugs.add(candidate);
        normalizedChildren.push({ ...ch, slug: candidate });
      }
    }

    const { subcategories, parentId, ...restCreate } = data;
    const createData: any = { ...restCreate, slug: finalSlug };
    if (parentId) createData.parentId = parentId;
    if (normalizedChildren.length) createData.children = { create: normalizedChildren };

    const cat = await this.prisma.category.create({ data: createData });
    return cat;
  }

  async update(id: number, dto: UpdateCategoryDto) {
    if (typeof id !== 'number' || Number.isNaN(id)) throw new BadRequestException('Invalid category id');
    const data: any = { ...dto };
    
    const currentCategory = await this.prisma.category.findUnique({ where: { id } });
    if (!currentCategory) throw new BadRequestException('Category not found');

    // If parentId is being set or changed, generate hierarchical slug
    if (dto.parentId !== undefined) {
      if (dto.parentId) {
        // Category is being set as a subcategory - generate hierarchical slug
        data.slug = await this.makeSubcategorySlug(dto.parentId, dto.name || currentCategory.name);
      } else if (currentCategory.parentId) {
        // Category is being changed from subcategory to top-level - generate non-hierarchical slug
        const baseSlug = this.slugify(dto.name || currentCategory.name);
        data.slug = await this.makeUniqueSlug(baseSlug, id);
      }
    } else if (dto.name && !dto.slug && currentCategory.parentId) {
      // Name is being changed but parentId stays the same (and category is a subcategory) - regenerate hierarchical slug
      data.slug = await this.makeSubcategorySlug(currentCategory.parentId, dto.name);
    } else if (dto.name && !dto.slug) {
      // Top-level category name change
      data.slug = await this.makeUniqueSlug(this.slugify(dto.name), id);
    } else if (dto.slug) {
      // Custom slug provided - ensure uniqueness
      data.slug = await this.makeUniqueSlug(dto.slug, id);
    }

    const { subcategories, ...rest } = data;
    const cat = await this.prisma.category.update({ where: { id }, data: rest, include: { children: true } });
    return cat;
  }

  async makeSubcategorySlug(parentId: number, subcategoryName: string, excludeId?: number): Promise<string> {
    // Get parent category to include its slug
    const parent = await this.prisma.category.findUnique({ where: { id: parentId } });
    if (!parent) throw new BadRequestException('Parent category not found');

    // Generate slug: "subcategoryname-parentslug"
    const subSlug = this.slugify(subcategoryName);
    const hierarchicalBase = `${subSlug} ${parent.slug}`;
    
    // Make it unique
    return this.makeUniqueSlug(hierarchicalBase, excludeId);
  }

  async reorder(items: { id: number; order: number }[]) {
    if (!Array.isArray(items) || items.length === 0) return { success: true };
    const ops = items.map((it) => this.prisma.category.update({ where: { id: it.id }, data: { order: it.order } }));
    await this.prisma.$transaction(ops);
    return { success: true };
  }

  async delete(id: number) {
    await this.prisma.category.delete({ where: { id } });
    return { success: true };
  }

  async merge(dto: MergeCategoriesDto) {
    const { sourceId, targetId } = dto;
    if (sourceId === targetId) throw new BadRequestException('Source and target must differ');
    const source = await this.prisma.category.findUnique({ where: { id: sourceId } });
    const target = await this.prisma.category.findUnique({ where: { id: targetId } });
    if (!source || !target) throw new BadRequestException('Invalid category ids');

    // Reassign children of source to target
    await this.prisma.category.updateMany({ where: { parentId: sourceId }, data: { parentId: targetId } });

    // Note: If products exist, they'd be reassigned here as well (not implemented)

    // Delete source
    await this.prisma.category.delete({ where: { id: sourceId } });

    return { success: true };
  }

  async bulkAction(ids: number[], action: string) {
    if (!Array.isArray(ids) || ids.length === 0) throw new BadRequestException('No ids provided');
    if (action === 'activate') {
      await this.prisma.category.updateMany({ where: { id: { in: ids } }, data: { active: true } });
    } else if (action === 'deactivate') {
      await this.prisma.category.updateMany({ where: { id: { in: ids } }, data: { active: false } });
    } else if (action === 'delete') {
      await this.prisma.category.deleteMany({ where: { id: { in: ids } } });
    } else if (action === 'export') {
      const data = await this.prisma.category.findMany({ where: { id: { in: ids } } });
      return data;
    } else {
      throw new BadRequestException('Unknown action');
    }
    return { success: true };
  }

  private slugify(s: string) {
  const slug = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  return slug.charAt(0).toUpperCase() + slug.slice(1);
}


  private async makeUniqueSlug(base: string, excludeId?: number): Promise<string> {
    let candidate = (base || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    if (!candidate) candidate = 'item';
    let i = 1;
    while (true) {
      const found = await this.prisma.category.findUnique({ where: { slug: candidate } });
      if (!found) return candidate;
      if (excludeId && found.id === excludeId) return candidate;
      candidate = `${candidate}-${i++}`;
    }
  }
}
