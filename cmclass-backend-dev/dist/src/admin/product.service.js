"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ProductService = class ProductService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list({ page = 1, pageSize = 20, search = '', categoryId } = {}) {
        const where = {};
        if (search)
            where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { description: { contains: search, mode: 'insensitive' } }];
        if (categoryId)
            where.categoryId = Number(categoryId);
        const total = await this.prisma.product.count({ where });
        const data = await this.prisma.product.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * pageSize, take: pageSize, include: { category: true } });
        return { data, meta: { total, page, pageSize } };
    }
    async get(id) {
        const p = await this.prisma.product.findUnique({ where: { id }, include: { category: true } });
        if (!p)
            throw new common_1.BadRequestException('Product not found');
        return p;
    }
    async create(dto) {
        if (!dto.name)
            throw new common_1.BadRequestException('Product name is required');
        if (!dto.categoryId)
            throw new common_1.BadRequestException('Category is required');
        const slug = dto.slug || this.slugify(dto.name);
        // Ensure category exists
        const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
        if (!cat)
            throw new common_1.BadRequestException('Invalid category');
        // Only include valid fields from schema
        const data = {
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
        }
        catch (error) {
            console.error('Error creating product:', error);
            throw new common_1.BadRequestException(error?.message || 'Failed to create product');
        }
    }
    async update(id, dto) {
        // Check if product exists
        const exists = await this.prisma.product.findUnique({ where: { id } });
        if (!exists)
            throw new common_1.BadRequestException('Product not found');
        // Only include fields that are provided
        const data = {};
        if (dto.name !== undefined)
            data.name = dto.name;
        if (dto.slug !== undefined)
            data.slug = dto.slug;
        else if (dto.name)
            data.slug = this.slugify(dto.name);
        if (dto.description !== undefined)
            data.description = dto.description;
        if (dto.productImage !== undefined)
            data.productImage = dto.productImage;
        if (dto.label !== undefined)
            data.label = dto.label;
        if (dto.images !== undefined)
            data.images = dto.images;
        if (dto.inStock !== undefined)
            data.inStock = dto.inStock;
        if (dto.longDescription !== undefined)
            data.longDescription = dto.longDescription;
        if (dto.mannequinImage !== undefined)
            data.mannequinImage = dto.mannequinImage;
        if (dto.colors !== undefined)
            data.colors = dto.colors;
        if (dto.sizes !== undefined)
            data.sizes = dto.sizes;
        if (dto.priceCents !== undefined)
            data.priceCents = dto.priceCents;
        if (dto.stock !== undefined)
            data.stock = dto.stock;
        if (dto.careInstructions !== undefined)
            data.careInstructions = dto.careInstructions;
        if (dto.environmentalInfo !== undefined)
            data.environmentalInfo = dto.environmentalInfo;
        if (dto.categoryId !== undefined) {
            const cat = await this.prisma.category.findUnique({ where: { id: dto.categoryId } });
            if (!cat)
                throw new common_1.BadRequestException('Invalid category');
            data.category = { connect: { id: dto.categoryId } };
        }
        const p = await this.prisma.product.update({ where: { id }, data });
        return p;
    }
    async delete(id) {
        await this.prisma.product.delete({ where: { id } });
        return { success: true };
    }
    slugify(s) {
        return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProductService);
