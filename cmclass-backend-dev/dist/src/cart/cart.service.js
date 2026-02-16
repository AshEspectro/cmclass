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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CartService = class CartService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getCart(userId) {
        const items = await this.prisma.cartItem.findMany({
            where: { userId },
            include: {
                product: true,
            },
            orderBy: { createdAt: 'asc' },
        });
        return items.map((item) => ({
            id: item.id,
            productId: item.productId,
            name: item.product.name,
            price: item.product.priceCents / 100, // Return as number for calculations
            label: item.product.label,
            productImage: item.product.productImage,
            mannequinImage: item.product.mannequinImage,
            colors: item.product.colors,
            quantity: item.quantity,
            selectedSize: item.size,
            selectedColor: item.color,
        }));
    }
    async addToCart(userId, productId, quantity, size, color) {
        const s = size || "";
        const c = color || "";
        const existing = await this.prisma.cartItem.findUnique({
            where: {
                userId_productId_size_color: {
                    userId,
                    productId,
                    size: s,
                    color: c,
                },
            },
        });
        if (existing) {
            return this.prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + quantity },
            });
        }
        return this.prisma.cartItem.create({
            data: {
                userId,
                productId,
                quantity,
                size: s,
                color: c,
            },
        });
    }
    async updateByVariation(userId, productId, size, color, quantity) {
        const s = size || "";
        const c = color || "";
        const existing = await this.prisma.cartItem.findUnique({
            where: {
                userId_productId_size_color: {
                    userId,
                    productId,
                    size: s,
                    color: c,
                },
            },
        });
        if (!existing)
            throw new common_1.NotFoundException('Cart item not found');
        if (quantity <= 0) {
            return this.prisma.cartItem.delete({ where: { id: existing.id } });
        }
        return this.prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity },
        });
    }
    async removeByVariation(userId, productId, size, color) {
        const s = size || "";
        const c = color || "";
        const existing = await this.prisma.cartItem.findUnique({
            where: {
                userId_productId_size_color: {
                    userId,
                    productId,
                    size: s,
                    color: c,
                },
            },
        });
        if (!existing)
            throw new common_1.NotFoundException('Cart item not found');
        return this.prisma.cartItem.delete({ where: { id: existing.id } });
    }
    async clearCart(userId) {
        return this.prisma.cartItem.deleteMany({
            where: { userId },
        });
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CartService);
