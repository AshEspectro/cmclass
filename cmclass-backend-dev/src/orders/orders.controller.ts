import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private prisma: PrismaService) {}

  @Get('me')
  async listMine(@Req() req) {
    const orders = await this.prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: orders.map((order) => ({
        id: order.id,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.totalCents / 100,
        currency: order.currency,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          name: item.product?.name || `Produit ${item.productId}`,
          quantity: item.quantity,
          price: item.priceCents / 100,
          size: item.size,
          color: item.color,
          image: item.product?.productImage || item.product?.mannequinImage || null,
        })),
      })),
    };
  }

  @Post()
  async createFromCart(@Req() req, @Body() body: { paymentStatus?: 'PENDING' | 'PAID' | 'REFUNDED' }) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    const totalCents = cartItems.reduce((sum, item) => {
      const priceCents = item.product?.priceCents || 0;
      return sum + priceCents * item.quantity;
    }, 0);

    const order = await this.prisma.order.create({
      data: {
        userId: req.user.id,
        status: 'PENDING',
        paymentStatus: body?.paymentStatus || 'PENDING',
        totalCents,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceCents: item.product?.priceCents || 0,
            size: item.size || '',
            color: item.color || '',
          })),
        },
      },
      include: { items: true },
    });

    await this.prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    return { data: order };
  }
}
