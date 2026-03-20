import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Generates a random alphanumeric pickup code.
 * e.g. "X4K9PQ"
 */
function generatePickupCode(length = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I/O/0/1 to avoid ambiguity
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  /** Log a status transition in the audit trail. */
  async logStatusHistory(
    orderId: number,
    fromStatus: string | null,
    toStatus: string,
    changedBy: string,
    reason?: string,
  ) {
    await this.prisma.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: fromStatus as any,
        toStatus: toStatus as any,
        changedBy,
        reason,
      },
    });
  }

  /** Build the full customer-facing order shape. */
  async findMyOrders(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        orderNotifications: {
          where: { type: 'ORDER_READY' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders.map((o) => this.mapOrder(o));
  }

  private getUrl(url: string | null) {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const base =
      process.env.VITE_API_URL ||
      process.env.PUBLIC_ASSET_URL ||
      `http://localhost:${process.env.PORT || 3000}`;
    return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  mapOrder(order: any) {
    const latestNotif = order.orderNotifications?.[0] ?? null;
    return {
      id: order.id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      fulfillmentMethod: order.fulfillmentMethod,
      total: order.totalCents / 100,
      currency: order.currency,
      pickupCode: order.pickupCode,
      reservedUntil: order.reservedUntil,
      readyAt: order.readyAt,
      pickupExpiresAt: order.pickupExpiresAt,
      cancelReason: order.cancelReason,
      createdAt: order.createdAt,
      readyNotificationStatus: latestNotif?.status ?? null,
      items: (order.items ?? []).map((item: any) => ({
        id: item.id,
        productId: item.productId,
        name: item.product?.name || `Produit ${item.productId}`,
        quantity: item.quantity,
        price: item.priceCents / 100,
        size: item.size,
        color: item.color,
        image: this.getUrl(
          item.product?.productImage || item.product?.mannequinImage,
        ),
      })),
    };
  }

  /** Generate a unique pickup code (retries on collision). */
  async generateUniquePickupCode(): Promise<string> {
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = generatePickupCode();
      const existing = await this.prisma.order.findFirst({
        where: { pickupCode: code },
      });
      if (!existing) return code;
    }
    // Fallback: timestamp-based
    return `CMD${Date.now().toString(36).toUpperCase()}`;
  }
}
