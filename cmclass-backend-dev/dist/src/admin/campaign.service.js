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
exports.CampaignService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CampaignService = class CampaignService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return await this.prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
    async get(id) {
        return await this.prisma.campaign.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return await this.prisma.campaign.create({
            data: {
                title: data.title,
                genreText: data.genreText,
                imageUrl: data.imageUrl,
                buttonText: data.buttonText,
                selectedCategories: data.selectedCategories || [],
                selectedProductIds: data.selectedProductIds || [],
                status: data.status || 'Brouillon',
            },
        });
    }
    async update(id, data) {
        return await this.prisma.campaign.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return await this.prisma.campaign.delete({
            where: { id },
        });
    }
};
exports.CampaignService = CampaignService;
exports.CampaignService = CampaignService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignService);
