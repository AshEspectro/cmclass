import { BadRequestException, Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from '../notification/notification.service';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService
  ) { }

  private getUrl(url: string | null) {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;

    // Prefer VITE_API_URL or PUBLIC_ASSET_URL for production
    const base = process.env.VITE_API_URL || process.env.PUBLIC_ASSET_URL || `http://localhost:${process.env.PORT || 3000}`;

    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }

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
          name: item.product?.name || `Product ${item.productId}`,
          quantity: item.quantity,
          price: item.priceCents / 100,
          size: item.size,
          color: item.color,
          image: this.getUrl(item.product?.productImage || item.product?.mannequinImage),
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
      include: { items: { include: { product: true } } },
    });

    // Notify admin about new order
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    await this.notificationService.create({
      title: 'Nouvelle commande',
      message: `${user?.firstName || user?.username} a passé une commande (#${order.id}) pour ${totalCents / 100} ${order.currency}.`,
      type: 'ORDER',
    });

    // Check for low stock items
    for (const item of order.items) {
      if (item.product && item.product.stock <= 5) {
        await this.notificationService.create({
          title: 'Stock faible',
          message: `Le produit "${item.product.name}" est presque épuisé (${item.product.stock} restants).`,
          type: 'STOCK',
        });
      }
    }

    await this.prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    return { data: order };
  }
}
