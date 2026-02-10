import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WishlistService {
    constructor(private prisma: PrismaService) { }

    async getWishlist(userId: number) {
        const items = await this.prisma.wishlistItem.findMany({
            where: { userId },
            include: {
                product: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return items.map((item) => ({
            id: item.product.id, // Frontend matches on product ID
            dbId: item.id,
            name: item.product.name,
            price: item.product.priceCents / 100, // Return number
            label: item.product.label,
            productImage: item.product.productImage,
            mannequinImage: item.product.mannequinImage,
            colors: item.product.colors,
        }));
    }

    async addToWishlist(userId: number, productId: number) {
        const existing = await this.prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (existing) {
            return existing;
        }

        return this.prisma.wishlistItem.create({
            data: {
                userId,
                productId,
            },
        });
    }

    async removeFromWishlist(userId: number, productId: number) {
        const item = await this.prisma.wishlistItem.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });

        if (!item) throw new NotFoundException('Wishlist item not found');

        return this.prisma.wishlistItem.delete({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
        });
    }

    async clearWishlist(userId: number) {
        return this.prisma.wishlistItem.deleteMany({
            where: { userId },
        });
    }
}
