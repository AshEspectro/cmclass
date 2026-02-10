import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

type OrderStatus = 'Livrée' | 'En Transit' | 'En Préparation' | 'Annulée';
type PaymentStatus = 'Payée' | 'Remboursée' | 'En attente';

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT')
export class OrdersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async list() {
    const orders = await this.prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const statusMap: Record<string, OrderStatus> = {
      PENDING: 'En Préparation',
      PROCESSING: 'En Préparation',
      SHIPPED: 'En Transit',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    };

    const paymentMap: Record<string, PaymentStatus> = {
      PENDING: 'En attente',
      PAID: 'Payée',
      REFUNDED: 'Remboursée',
    };

    const mapped = orders.map((order) => {
      const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
      return {
        id: `#CMD-${order.id}`,
        customer: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.username || order.user?.email || `Client ${order.userId}`,
        email: order.user?.email || '',
        date: order.createdAt.toISOString().slice(0, 10),
        total: order.totalCents / 100,
        status: statusMap[order.status] || 'En Préparation',
        items: itemsCount,
        payment: paymentMap[order.paymentStatus] || 'En attente',
        lines: order.items.map((item) => ({
          name: item.product?.name || `Produit ${item.productId}`,
          quantity: item.quantity,
          price: item.priceCents / 100,
          size: item.size || '',
          color: item.color || '',
          image: item.product?.productImage || null,
        })),
      };
    });

    const totalOrders = mapped.length;
    const pendingOrders = mapped.filter((o) => o.status === 'En Préparation').length;
    const inTransitOrders = mapped.filter((o) => o.status === 'En Transit').length;
    const totalRevenue = mapped.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      stats: {
        totalOrders,
        pendingOrders,
        inTransitOrders,
        avgOrderValue,
      },
      orders: mapped,
    };
  }
}
