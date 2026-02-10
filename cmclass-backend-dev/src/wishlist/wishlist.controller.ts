import { Controller, Get, Post, Body, Delete, UseGuards, Req, Param, ParseIntPipe } from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wishlist')
@UseGuards(JwtAuthGuard)
export class WishlistController {
    constructor(private readonly wishlistService: WishlistService) { }

    @Get()
    async getWishlist(@Req() req) {
        const items = await this.wishlistService.getWishlist(req.user.id);
        return { data: items };
    }

    @Post()
    async addToWishlist(@Req() req, @Body() body: { productId: number }) {
        return this.wishlistService.addToWishlist(req.user.id, body.productId);
    }

    @Delete(':productId')
    async removeFromWishlist(@Req() req, @Param('productId', ParseIntPipe) productId: number) {
        return this.wishlistService.removeFromWishlist(req.user.id, productId);
    }

    @Delete()
    async clearWishlist(@Req() req) {
        return this.wishlistService.clearWishlist(req.user.id);
    }
}
