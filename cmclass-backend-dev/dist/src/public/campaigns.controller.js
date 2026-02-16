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
exports.CampaignsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CampaignsController = class CampaignsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const campaigns = await this.prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { data: campaigns };
    }
    async get(id) {
        // Validate and parse ID
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException('Invalid campaign ID. Must be a valid integer.');
        }
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: parsedId },
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign with ID ${parsedId} not found`);
        }
        return { data: campaign };
    }
    async getCatalog(id) {
        // Validate and parse ID
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException('Invalid campaign ID. Must be a valid integer.');
        }
        // Get campaign to verify it exists and get selectedProductIds
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: parsedId },
        });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign with ID ${parsedId} not found`);
        }
        // Fetch products that match the campaign's selectedProductIds
        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: campaign.selectedProductIds,
                },
            },
            take: 4,
        });
        return { data: products, campaign };
    }
    async getCategories(id) {
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) {
            throw new common_1.BadRequestException('Invalid campaign ID. Must be a valid integer.');
        }
        const campaign = await this.prisma.campaign.findUnique({ where: { id: parsedId } });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign with ID ${parsedId} not found`);
        }
        // Fetch selected categories and return summary fields + product counts
        const categories = await this.prisma.category.findMany({
            where: { id: { in: campaign.selectedCategories }, active: true },
            select: {
                id: true,
                name: true,
                imageUrl: true,
                description: true,
                order: true,
            },
            orderBy: { order: 'asc' },
        });
        // Count active products per category
        const counts = await Promise.all(categories.map((c) => this.prisma.product.count({ where: { categoryId: c.id, status: 'ACTIVE' } })));
        const result = categories.map((c, idx) => ({
            id: c.id,
            name: c.name,
            imageUrl: c.imageUrl || null,
            description: c.description || null,
            productCount: counts[idx] ?? 0,
        }));
        return { data: result, campaign };
    }
    async getCategoryDetail(id, catId) {
        const parsedCampaignId = parseInt(id, 10);
        const parsedIndex = parseInt(catId, 10); // position in campaign.selectedCategories (1-based)
        if (isNaN(parsedCampaignId) || isNaN(parsedIndex)) {
            throw new common_1.BadRequestException('Invalid ID. Must be valid integers.');
        }
        const campaign = await this.prisma.campaign.findUnique({ where: { id: parsedCampaignId } });
        if (!campaign) {
            throw new common_1.NotFoundException(`Campaign with ID ${parsedCampaignId} not found`);
        }
        // Convert 1-based position to zero-based index
        const position = parsedIndex - 1;
        if (position < 0 || position >= (campaign.selectedCategories?.length || 0)) {
            throw new common_1.NotFoundException(`Category position ${parsedIndex} is out of range for campaign ${parsedCampaignId}`);
        }
        const categoryId = campaign.selectedCategories[position];
        const category = await this.prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                products: {
                    where: { status: 'ACTIVE' },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Category with ID ${categoryId} not found`);
        }
        return { data: category, campaign };
    }
};
exports.CampaignsController = CampaignsController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "get", null);
__decorate([
    (0, common_1.Get)(':id/catalog'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "getCatalog", null);
__decorate([
    (0, common_1.Get)(':id/categories'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)(':id/categories/:catId'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('catId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CampaignsController.prototype, "getCategoryDetail", null);
exports.CampaignsController = CampaignsController = __decorate([
    (0, common_1.Controller)('campaigns'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignsController);
