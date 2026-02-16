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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicProductController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicProductController = class PublicProductController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(page = '1', pageSize = '20', categoryId, search = '') {
        const ASSET_BASE = process.env.PUBLIC_ASSET_URL || 'http://localhost:3000';
        const where = { status: 'ACTIVE' };
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
        const data = products.map((p) => ({
            id: p.id,
            label: p.label || null,
            name: p.name,
            price: p.priceCents ? p.priceCents / 100 : 0,
            sizes: p.sizes || [],
            longDescription: p.longDescription || null,
            productImage: p.productImage || null,
            mannequinImage: p.mannequinImage || null,
            colors: p.colors ? (Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors)) : [],
            images: p.images || [],
            inStock: p.inStock,
            categoryId: p.categoryId,
            category: p.category?.name || null,
        }));
        return { data, meta: { total, page: Number(page), pageSize: Number(pageSize) } };
    }
    async getProduct(id) {
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
            price: product.priceCents ? product.priceCents / 100 : 0,
            sizes: product.sizes || [],
            longDescription: product.longDescription || null,
            productImage: product.productImage || null,
            mannequinImage: product.mannequinImage || null,
            colors: product.colors ? (Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors)) : [],
            images: product.images || [],
            inStock: product.inStock,
            categoryId: product.categoryId,
            category: product.category?.name || null,
            description: product.description || null,
        };
        return { data };
    }
    async getByCategory(slug) {
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
            price: p.priceCents ? p.priceCents / 100 : 0,
            sizes: p.sizes || [],
            longDescription: p.longDescription || null,
            productImage: p.productImage || null,
            mannequinImage: p.mannequinImage || null,
            colors: p.colors ? (Array.isArray(p.colors) ? p.colors : JSON.parse(p.colors)) : [],
            images: p.images || [],
            inStock: p.inStock,
            categoryId: p.categoryId,
            category: category.name,
        }));
        return { data };
    }
};
exports.PublicProductController = PublicProductController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('categoryId')),
    __param(3, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, Object]),
    __metadata("design:returntype", Promise)
], PublicProductController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProductController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Get)('category/:categorySlug'),
    __param(0, (0, common_1.Param)('categorySlug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicProductController.prototype, "getByCategory", null);
exports.PublicProductController = PublicProductController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicProductController);
