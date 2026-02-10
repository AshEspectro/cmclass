import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificationService } from '../notification/notification.service';

type AlertPriority = 'high' | 'medium' | 'low';

@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT')
export class DashboardController {
  constructor(private prisma: PrismaService, private notifications: NotificationService) {}

  private getMonthLabels(): string[] {
    return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  }

  @Get()
  async getDashboard() {
    const [usersCount, ordersCount, productsCount, notifSummary] = await Promise.all([
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.order.count(),
      this.prisma.product.count(),
      this.notifications.summary(),
    ]);

    const orders = await this.prisma.order.findMany({
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    const totalRevenue = orders.reduce((sum, order) => sum + order.totalCents / 100, 0);

    const conversionRate = usersCount > 0 ? (ordersCount / usersCount) * 100 : 0;

    // Sales data for the last 6 months (based on orders)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push(d);
    }
    const start = new Date(months[0].getFullYear(), months[0].getMonth(), 1);
    const recentOrders = orders.filter((order) => order.createdAt >= start);
    const labels = this.getMonthLabels();
    const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

    const salesMap = new Map<string, { revenue: number; orders: number }>();
    for (const m of months) {
      salesMap.set(monthKey(m), { revenue: 0, orders: 0 });
    }
    for (const order of recentOrders) {
      const key = monthKey(order.createdAt);
      const entry = salesMap.get(key);
      if (!entry) continue;
      entry.revenue += order.totalCents / 100;
      entry.orders += 1;
    }

    const salesData = months.map((m) => ({
      month: labels[m.getMonth()],
      revenue: Number(salesMap.get(monthKey(m))?.revenue || 0),
      orders: Number(salesMap.get(monthKey(m))?.orders || 0),
    }));

    // Top products by order items
    const productMap = new Map<number, { name: string; sales: number; revenue: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        const id = item.productId;
        const name = item.product?.name || `Produit ${id}`;
        const entry = productMap.get(id) || { name, sales: 0, revenue: 0 };
        entry.sales += item.quantity;
        entry.revenue += (item.priceCents * item.quantity) / 100;
        productMap.set(id, entry);
      }
    }
    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Content alerts
    const [missingDescription, missingImage, draftCampaigns] = await Promise.all([
      this.prisma.product.count({ where: { description: null } }),
      this.prisma.product.count({ where: { productImage: null } }),
      this.prisma.campaign.count({ where: { status: 'Brouillon' } }),
    ]);

    const contentAlerts: { type: string; message: string; priority: AlertPriority }[] = [];
    if (missingDescription > 0) {
      contentAlerts.push({
        type: 'Description Produit',
        message: `${missingDescription} produits sans description`,
        priority: missingDescription > 5 ? 'high' : 'medium',
      });
    }
    if (missingImage > 0) {
      contentAlerts.push({
        type: 'Images Produit',
        message: `${missingImage} produits sans image principale`,
        priority: missingImage > 5 ? 'high' : 'medium',
      });
    }
    if (draftCampaigns > 0) {
      contentAlerts.push({
        type: 'Campagnes',
        message: `${draftCampaigns} campagnes en brouillon`,
        priority: draftCampaigns > 3 ? 'medium' : 'low',
      });
    }
    if (contentAlerts.length === 0) {
      contentAlerts.push({
        type: 'Contenu',
        message: 'Tout est à jour',
        priority: 'low',
      });
    }

    return {
      stats: {
        totalRevenue,
        totalOrders: ordersCount,
        totalCustomers: usersCount,
        conversionRate,
        totalProducts: productsCount,
      },
      salesData,
      topProducts,
      contentAlerts,
      notifications: notifSummary.latest,
      unreadNotifications: notifSummary.unread,
    };
  }
}
