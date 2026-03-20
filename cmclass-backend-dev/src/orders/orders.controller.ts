import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { NotificationService } from '../notification/notification.service';
import { OrdersService } from './orders.service';

const RESERVATION_TTL_HOURS = parseInt(
  process.env.RESERVATION_TTL_HOURS ?? '48',
  10,
);

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private ordersService: OrdersService,
  ) {}

  /** GET /orders/me — customer order list */
  @Get('me')
  async listMine(@Req() req) {
    const orders = await this.ordersService.findMyOrders(req.user.id);
    return { data: orders };
  }

  /**
   * POST /orders
   * Body: { paymentMethod: 'PAY_IN_STORE' | 'MAXICASH' }
   *
   * PAY_IN_STORE → status=RESERVED, paymentStatus=UNPAID, pickupCode, reservedUntil
   * MAXICASH     → status=AWAITING_PAYMENT, paymentStatus=PENDING
   *
   * Cart is always cleared after creation.
   * MaxiCash URL is NOT initiated here; the client calls POST /maxicash/initiate separately.
   */
  @Post()
  async createFromCart(
    @Req() req,
    @Body() body: { paymentMethod?: 'PAY_IN_STORE' | 'MAXICASH' },
  ) {
    const paymentMethod: 'PAY_IN_STORE' | 'MAXICASH' =
      body?.paymentMethod === 'MAXICASH' ? 'MAXICASH' : 'PAY_IN_STORE';

    // ── 1. Validate cart ───────────────────────────────────────────────────
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId: req.user.id },
      include: { product: true },
      orderBy: { createdAt: 'asc' },
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('Le panier est vide.');
    }

    const totalCents = cartItems.reduce(
      (sum, item) => sum + (item.product?.priceCents ?? 0) * item.quantity,
      0,
    );

    // ── 2. Compute branch-specific fields ─────────────────────────────────
    let orderStatus: any;
    let paymentStatus: any;
    let pickupCode: string | undefined;
    let reservedUntil: Date | undefined;

    if (paymentMethod === 'PAY_IN_STORE') {
      orderStatus = 'RESERVED';
      paymentStatus = 'UNPAID';
      pickupCode = await this.ordersService.generateUniquePickupCode();
      reservedUntil = new Date(
        Date.now() + RESERVATION_TTL_HOURS * 60 * 60 * 1000,
      );
    } else {
      orderStatus = 'AWAITING_PAYMENT';
      paymentStatus = 'PENDING';
    }

    // ── 2b. Fetch storefront currency from Brand ──────────────────────────
    const brand = await this.prisma.brand.findFirst();
    const storefrontCurrency = brand?.storefrontCurrency || 'FC';

    // ── 3. Create order ───────────────────────────────────────────────────
    const order = await this.prisma.order.create({
      data: {
        userId: req.user.id,
        status: orderStatus,
        paymentStatus,
        paymentMethod,
        fulfillmentMethod: 'PICKUP',
        totalCents,
        currency: storefrontCurrency,
        pickupCode,
        reservedUntil,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            priceCents: item.product?.priceCents ?? 0,
            size: item.size || '',
            color: item.color || '',
          })),
        },
      },
      include: {
        items: { include: { product: true } },
        orderNotifications: true,
      },
    });

    // ── 4. Audit trail ────────────────────────────────────────────────────
    await this.ordersService.logStatusHistory(
      order.id,
      null,
      orderStatus,
      'SYSTEM',
    );

    // ── 5. Admin notifications ────────────────────────────────────────────
    const user = await this.prisma.user.findUnique({
      where: { id: req.user.id },
    });
    const clientName =
      user?.firstName || user?.username || `Client #${req.user.id}`;

    if (paymentMethod === 'PAY_IN_STORE') {
      await this.notificationService.create({
        title: 'Nouvelle réservation',
        message: `${clientName} a réservé une commande (#${order.id}) · Code: ${pickupCode} · Total: ${totalCents / 100} FC.`,
        type: 'ORDER',
      });
    } else {
      await this.notificationService.create({
        title: 'Paiement mobile money initié',
        message: `${clientName} a initié un paiement MaxiCash pour la commande #${order.id} · Total: ${totalCents / 100} FC.`,
        type: 'ORDER',
      });
    }

    // ── 6. Low-stock alerts ───────────────────────────────────────────────
    for (const item of order.items) {
      if (item.product && item.product.stock <= 5) {
        await this.notificationService.create({
          title: 'Stock faible',
          message: `"${item.product.name}" est presque épuisé (${item.product.stock} restants).`,
          type: 'STOCK',
        });
      }
    }

    // ── 7. Clear cart ─────────────────────────────────────────────────────
    await this.prisma.cartItem.deleteMany({ where: { userId: req.user.id } });

    return { data: this.ordersService.mapOrder(order) };
  }
}
