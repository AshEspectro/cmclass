import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OrdersService } from './orders.service';

/**
 * Runs every 15 minutes and marks stale RESERVED / READY_FOR_PICKUP
 * orders as EXPIRED.
 *
 * Schedule can be adjusted via EXPIRY_CRON_SCHEDULE env var
 * (defaults to every 15 minutes).
 */
@Injectable()
export class OrdersExpiryCron {
  private readonly logger = new Logger(OrdersExpiryCron.name);

  constructor(
    private prisma: PrismaService,
    private ordersService: OrdersService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async expireStaleOrders() {
    const now = new Date();

    // ── 1. Expired reservations (PAY_IN_STORE, past reservedUntil) ────────
    const expiredReservations = await this.prisma.order.findMany({
      where: {
        status: 'RESERVED',
        reservedUntil: { lt: now },
      },
      select: { id: true, status: true },
    });

    if (expiredReservations.length > 0) {
      await this.prisma.order.updateMany({
        where: { id: { in: expiredReservations.map((o) => o.id) } },
        data: { status: 'EXPIRED' },
      });

      for (const o of expiredReservations) {
        await this.ordersService.logStatusHistory(
          o.id, 'RESERVED', 'EXPIRED', 'SYSTEM', 'Reservation TTL expired',
        );
      }

      this.logger.log(
        `Expired ${expiredReservations.length} reservation(s): ${expiredReservations.map((o) => o.id).join(', ')}`,
      );
    }

    // ── 2. Missed pickups (READY_FOR_PICKUP, past pickupExpiresAt) ─────────
    const expiredPickups = await this.prisma.order.findMany({
      where: {
        status: 'READY_FOR_PICKUP',
        pickupExpiresAt: { lt: now },
      },
      select: { id: true, status: true },
    });

    if (expiredPickups.length > 0) {
      await this.prisma.order.updateMany({
        where: { id: { in: expiredPickups.map((o) => o.id) } },
        data: { status: 'EXPIRED' },
      });

      for (const o of expiredPickups) {
        await this.ordersService.logStatusHistory(
          o.id, 'READY_FOR_PICKUP', 'EXPIRED', 'SYSTEM', 'Pickup window expired',
        );
      }

      this.logger.log(
        `Expired ${expiredPickups.length} ready-for-pickup order(s): ${expiredPickups.map((o) => o.id).join(', ')}`,
      );
    }
  }
}
