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
exports.PublicCategoryController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PublicCategoryController = class PublicCategoryController {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
        const ASSET_BASE = process.env.PUBLIC_ASSET_URL || 'http://localhost:3000';
        const heroContent = {};
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
    async getById(id) {
        // Validate and parse ID
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId) || parsedId <= 0) {
            throw new common_1.BadRequestException('Invalid category ID. Must be a valid positive integer.');
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
            throw new common_1.NotFoundException(`Category with ID ${parsedId} not found`);
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
};
exports.PublicCategoryController = PublicCategoryController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicCategoryController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PublicCategoryController.prototype, "getById", null);
exports.PublicCategoryController = PublicCategoryController = __decorate([
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PublicCategoryController);
