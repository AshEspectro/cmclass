import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
  Query,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificationService } from '../notification/notification.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { OrdersService } from '../orders/orders.service';

// ── French label maps ──────────────────────────────────────────────────────────

const ORDER_STATUS_LABELS: Record<string, string> = {
  CREATED: 'Nouvelle',
  RESERVED: 'Réservée',
  AWAITING_PAYMENT: 'Attente de paiement',
  CONFIRMED: 'Confirmée',
  PREPARING: 'Préparation',
  READY_FOR_PICKUP: 'Prête au retrait',
  PICKED_UP: 'Retirée',
  EXPIRED: 'Expirée',
  CANCELLED: 'Annulée',
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  UNPAID: 'Non payé',
  PENDING: 'Paiement en attente',
  PAID: 'Payé',
  FAILED: 'Paiement échoué',
  CANCELLED_PAYMENT: 'Paiement annulé',
  REFUNDED: 'Remboursé',
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  MAXICASH: 'Mobile money',
  PAY_IN_STORE: 'Paiement en boutique',
};

// ── Pickup TTL ─────────────────────────────────────────────────────────────────
const PICKUP_EXPIRES_HOURS = parseInt(
  process.env.PICKUP_EXPIRES_HOURS ?? '48',
  10,
);

// ── Valid admin transitions ────────────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  RESERVED: ['PREPARING', 'CANCELLED'],
  AWAITING_PAYMENT: ['CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: [],
  EXPIRED: [],
  CANCELLED: [],
  CREATED: ['CANCELLED'],
};

@Controller('admin/orders')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT')
export class AdminOrdersController {
  constructor(
    private prisma: PrismaService,
    private notificationService: NotificationService,
    private whatsappService: WhatsappService,
    private ordersService: OrdersService,
  ) {}

  // ── GET /admin/orders ────────────────────────────────────────────────────────
  /**
   * Query params:
   *   tab = 'action' | 'in_progress' | 'ready' | 'completed' | 'issues'
   */
  @Get()
  async list(@Query('tab') tab?: string) {
    const now = new Date();
    const soonThreshold = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2h from now

    const where: any = {};

    if (tab === 'action') {
      where.status = { in: ['CREATED', 'RESERVED', 'AWAITING_PAYMENT'] };
    } else if (tab === 'in_progress') {
      where.status = { in: ['CONFIRMED', 'PREPARING'] };
    } else if (tab === 'ready') {
      where.status = 'READY_FOR_PICKUP';
    } else if (tab === 'completed') {
      where.status = 'PICKED_UP';
    } else if (tab === 'issues') {
      where.OR = [
        { paymentStatus: 'FAILED' },
        { status: { in: ['CANCELLED', 'EXPIRED'] } },
      ];
    }
    // no tab → return all

    const orders = await this.prisma.order.findMany({
      where,
      include: {
        user: true,
        items: { include: { product: true } },
        orderNotifications: {
          where: { type: 'ORDER_READY' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const mapped = orders.map((order) => {
      const latestNotif = order.orderNotifications?.[0] ?? null;
      const itemsCount = order.items.reduce((s, i) => s + i.quantity, 0);

      const badges: string[] = [];
      if (latestNotif?.status === 'SENT') badges.push('whatsapp_sent');
      if (latestNotif?.status === 'FAILED') badges.push('whatsapp_failed');
      if (latestNotif?.status === 'PENDING') badges.push('whatsapp_pending');
      if (
        order.reservedUntil &&
        order.status === 'RESERVED' &&
        order.reservedUntil < soonThreshold
      ) {
        badges.push('reservation_expiring_soon');
      }
      if (
        order.pickupExpiresAt &&
        order.status === 'READY_FOR_PICKUP' &&
        order.pickupExpiresAt < soonThreshold
      ) {
        badges.push('pickup_expiring_soon');
      }

      const allowedActions = ALLOWED_TRANSITIONS[order.status] ?? [];

      return {
        id: order.id,
        userId: order.userId,
        displayId: `#CMD-${order.id}`,
        customer:
          `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim() ||
          order.user?.username ||
          order.user?.email ||
          `Client ${order.userId}`,
        email: order.user?.email ?? '',
        phone: `${order.user?.phoneCountryCode ?? ''}${order.user?.phoneNumber ?? ''}`.trim(),
        paymentMethod: order.paymentMethod,
        paymentMethodLabel: PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod,
        paymentStatus: order.paymentStatus,
        paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus,
        status: order.status,
        statusLabel: ORDER_STATUS_LABELS[order.status] ?? order.status,
        total: order.totalCents / 100,
        currency: order.currency,
        itemsCount,
        pickupCode: order.pickupCode,
        reservedUntil: order.reservedUntil,
        readyAt: order.readyAt,
        pickupExpiresAt: order.pickupExpiresAt,
        cancelReason: order.cancelReason,
        whatsappStatus: latestNotif?.status ?? null,
        badges,
        allowedActions,
        createdAt: order.createdAt,
        lines: order.items.map((item) => ({
          name: item.product?.name ?? `Produit ${item.productId}`,
          quantity: item.quantity,
          price: item.priceCents / 100,
          size: item.size,
          color: item.color,
          image: item.product?.productImage ?? null,
        })),
      };
    });

    const stats = {
      actionNeeded: orders.filter((o) =>
        ['CREATED', 'RESERVED', 'AWAITING_PAYMENT'].includes(o.status),
      ).length,
      inProgress: orders.filter((o) =>
        ['CONFIRMED', 'PREPARING'].includes(o.status),
      ).length,
      readyForPickup: orders.filter((o) => o.status === 'READY_FOR_PICKUP').length,
      completed: orders.filter((o) => o.status === 'PICKED_UP').length,
      issues: orders.filter(
        (o) =>
          o.paymentStatus === 'FAILED' ||
          ['CANCELLED', 'EXPIRED'].includes(o.status),
      ).length,
    };

    return { stats, orders: mapped };
  }

  // ── PATCH /admin/orders/:id/status ───────────────────────────────────────────
  @Patch(':id/status')
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: string; reason?: string },
    @Req() req,
  ) {
    const toStatus = body.status;
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new BadRequestException('Commande introuvable.');

    const allowed = ALLOWED_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(toStatus)) {
      throw new BadRequestException(
        `Transition non autorisée : ${order.status} → ${toStatus}`,
      );
    }

    const updateData: any = { status: toStatus };

    // ── Special: READY_FOR_PICKUP ──────────────────────────────────────────
    if (toStatus === 'READY_FOR_PICKUP') {
      const now = new Date();
      updateData.readyAt = now;
      updateData.pickupExpiresAt = new Date(
        now.getTime() + PICKUP_EXPIRES_HOURS * 60 * 60 * 1000,
      );
    }

    // ── Special: PICKED_UP via PAY_IN_STORE ───────────────────────────────
    if (toStatus === 'PICKED_UP' && order.paymentMethod === 'PAY_IN_STORE') {
      updateData.paymentStatus = 'PAID';
    }

    // ── Special: CANCELLED ─────────────────────────────────────────────────
    if (toStatus === 'CANCELLED') {
      const deletedOrder = await this.prisma.order.delete({
        where: { id },
      });
      return { data: { ...deletedOrder, status: 'CANCELLED' }, message: 'Commande supprimée avec succès' };
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: updateData,
    });

    // ── Audit trail ───────────────────────────────────────────────────────
    const changedBy = `ADMIN:${req.user?.id ?? 'unknown'}`;
    await this.ordersService.logStatusHistory(
      id, order.status, toStatus, changedBy, body.reason,
    );

    // ── WhatsApp trigger ──────────────────────────────────────────────────
    if (toStatus === 'READY_FOR_PICKUP') {
      // Fire-and-forget; non-blocking
      this.whatsappService.sendOrderReadyNotification(id).catch(() => {});
    }

    // ── Admin notification ────────────────────────────────────────────────
    await this.notificationService.create({
      title: `Commande #${id} mise à jour`,
      message: `Statut changé : ${ORDER_STATUS_LABELS[order.status]} → ${ORDER_STATUS_LABELS[toStatus]}`,
      type: 'ORDER',
    });

    return { data: updated };
  }

  // ── GET /admin/orders/:id — full order detail ────────────────────────────────
  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: true } },
        orderNotifications: { orderBy: { createdAt: 'desc' } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        maxicashTransactions: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!order) throw new BadRequestException('Commande introuvable.');

    const latestNotif = order.orderNotifications?.find(n => n.type === 'ORDER_READY') ?? null;
    const allowedActions = ALLOWED_TRANSITIONS[order.status] ?? [];

    return {
      data: {
        id: order.id,
        displayId: `#CMD-${order.id}`,
        // Customer
        customer: `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim()
          || order.user?.username || order.user?.email || `Client ${order.userId}`,
        email: order.user?.email ?? '',
        phone: `${order.user?.phoneCountryCode ?? ''}${order.user?.phoneNumber ?? ''}`.trim(),
        // Status
        status: order.status,
        statusLabel: ORDER_STATUS_LABELS[order.status] ?? order.status,
        paymentStatus: order.paymentStatus,
        paymentStatusLabel: PAYMENT_STATUS_LABELS[order.paymentStatus] ?? order.paymentStatus,
        paymentMethod: order.paymentMethod,
        paymentMethodLabel: PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod,
        fulfillmentMethod: order.fulfillmentMethod,
        // Financials
        total: order.totalCents / 100,
        currency: order.currency,
        // Pickup specifics
        pickupCode: order.pickupCode,
        reservedUntil: order.reservedUntil,
        readyAt: order.readyAt,
        pickupExpiresAt: order.pickupExpiresAt,
        cancelReason: order.cancelReason,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        // WhatsApp notification
        whatsappStatus: latestNotif?.status ?? null,
        whatsappSentAt: latestNotif?.sentAt ?? null,
        whatsappError: latestNotif?.errorMessage ?? null,
        // Allowed admin actions
        allowedActions,
        // Items
        lines: order.items.map(item => ({
          id: item.id,
          productId: item.productId,
          name: item.product?.name ?? `Produit ${item.productId}`,
          quantity: item.quantity,
          price: item.priceCents / 100,
          size: item.size,
          color: item.color,
          image: item.product?.productImage ?? null,
        })),
        // Audit trail
        statusHistory: (order.statusHistory ?? []).map(h => ({
          id: h.id,
          fromStatus: h.fromStatus,
          fromStatusLabel: h.fromStatus ? (ORDER_STATUS_LABELS[h.fromStatus] ?? h.fromStatus) : null,
          toStatus: h.toStatus,
          toStatusLabel: ORDER_STATUS_LABELS[h.toStatus] ?? h.toStatus,
          changedBy: h.changedBy,
          reason: h.reason,
          createdAt: h.createdAt,
        })),
        // Notification history
        notifications: (order.orderNotifications ?? []).map(n => ({
          id: n.id,
          type: n.type,
          channel: n.channel,
          status: n.status,
          sentAt: n.sentAt,
          errorMessage: n.errorMessage,
          createdAt: n.createdAt,
        })),
        // MaxiCash transactions
        maxicashTransactions: (order.maxicashTransactions ?? []).map(t => ({
          id: t.id,
          reference: t.reference,
          status: t.status,
          providerTxId: t.providerTxId,
          failureReason: t.failureReason,
          completedAt: t.completedAt,
          createdAt: t.createdAt,
        })),
      },
    };
  }

  // ── POST /admin/orders/:id/notify/retry ──────────────────────────────────────
  @Post(':id/notify/retry')
  async retryWhatsapp(@Param('id', ParseIntPipe) id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new BadRequestException('Commande introuvable.');
    if (order.status !== 'READY_FOR_PICKUP') {
      throw new ConflictException(
        'La commande doit être en statut READY_FOR_PICKUP pour renvoyer la notification.',
      );
    }

    const result = await this.whatsappService.retryOrderReadyNotification(id);
    if (!result.retried) {
      throw new ConflictException('La notification WhatsApp a déjà été envoyée.');
    }
    return { message: 'Renvoi WhatsApp initié.' };
  }
}
