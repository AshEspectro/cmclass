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
exports.FooterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FooterService = class FooterService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async listPublic() {
        return this.prisma.footerSection.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
                links: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    async listAll() {
        return this.prisma.footerSection.findMany({
            orderBy: { order: 'asc' },
            include: {
                links: {
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    async createSection(data) {
        return this.prisma.footerSection.create({
            data: {
                title: data.title,
                order: data.order ?? 0,
                isActive: data.isActive ?? true,
            },
        });
    }
    async updateSection(id, data) {
        return this.prisma.footerSection.update({
            where: { id },
            data,
        });
    }
    async deleteSection(id) {
        await this.prisma.footerSection.delete({ where: { id } });
    }
    async createLink(sectionId, data) {
        return this.prisma.footerLink.create({
            data: {
                sectionId,
                label: data.label,
                url: data.url,
                order: data.order ?? 0,
                isActive: data.isActive ?? true,
            },
        });
    }
    async updateLink(id, data) {
        return this.prisma.footerLink.update({
            where: { id },
            data,
        });
    }
    async deleteLink(id) {
        await this.prisma.footerLink.delete({ where: { id } });
    }
};
exports.FooterService = FooterService;
exports.FooterService = FooterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FooterService);
