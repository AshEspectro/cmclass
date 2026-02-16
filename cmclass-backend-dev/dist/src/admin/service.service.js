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
exports.ServiceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ServiceService = class ServiceService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        return await this.prisma.service.findMany({ orderBy: { order: 'asc' } });
    }
    async get(id) {
        return await this.prisma.service.findUnique({ where: { id } });
    }
    async create(data) {
        return await this.prisma.service.create({ data: {
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl,
                link: data.link,
                order: data.order || 0,
                isActive: data.isActive ?? true,
            } });
    }
    async update(id, data) {
        return await this.prisma.service.update({ where: { id }, data });
    }
    async delete(id) {
        return await this.prisma.service.delete({ where: { id } });
    }
};
exports.ServiceService = ServiceService;
exports.ServiceService = ServiceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ServiceService);
