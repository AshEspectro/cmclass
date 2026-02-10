import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
    constructor(private prisma: PrismaService) { }

    async getCart(userId: number) {
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

    async addToCart(userId: number, productId: number, quantity: number, size?: string, color?: string) {
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

    async updateByVariation(userId: number, productId: number, size: string | undefined, color: string | undefined, quantity: number) {
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

        if (!existing) throw new NotFoundException('Cart item not found');

        if (quantity <= 0) {
            return this.prisma.cartItem.delete({ where: { id: existing.id } });
        }

        return this.prisma.cartItem.update({
            where: { id: existing.id },
            data: { quantity },
        });
    }

    async removeByVariation(userId: number, productId: number, size?: string, color?: string) {
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

        if (!existing) throw new NotFoundException('Cart item not found');

        return this.prisma.cartItem.delete({ where: { id: existing.id } });
    }

    async clearCart(userId: number) {
        return this.prisma.cartItem.deleteMany({
            where: { userId },
        });
    }
}
