import { Controller, Get, Post, Body, Patch, Delete, UseGuards, Req } from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    async getCart(@Req() req) {
        const items = await this.cartService.getCart(req.user.id);
        return { data: items };
    }

    @Post('items')
    async addToCart(@Req() req, @Body() body: { productId: number; quantity: number; selectedSize?: string; selectedColor?: string }) {
        return this.cartService.addToCart(req.user.id, body.productId, body.quantity || 1, body.selectedSize, body.selectedColor);
    }

    @Patch('items')
    async updateQuantity(@Req() req, @Body() body: { productId: number; quantity: number; selectedSize?: string; selectedColor?: string }) {
        return this.cartService.updateByVariation(req.user.id, body.productId, body.selectedSize, body.selectedColor, body.quantity);
    }

    @Delete('items')
    async removeFromCart(@Req() req, @Body() body: { productId: number; selectedSize?: string; selectedColor?: string }) {
        return this.cartService.removeByVariation(req.user.id, body.productId, body.selectedSize, body.selectedColor);
    }

    @Delete()
    async clearCart(@Req() req) {
        return this.cartService.clearCart(req.user.id);
    }
}
