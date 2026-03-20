import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MaxicashService {
  private readonly logger = new Logger(MaxicashService.name);

  constructor(private prisma: PrismaService) {}

  async generatePaymentUrl(orderId: number): Promise<string> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) throw new Error('Commande introuvable.');

    const merchantId = process.env.MAXICASH_MERCHANT_ID || '';
    const merchantPassword = process.env.MAXICASH_MERCHANT_PASSWORD || '';
    const gatewayUrl =
      process.env.MAXICASH_GATEWAY_URL ||
      'https://sandbox.maxicashapp.com/PayNow';

    const reference = `ORDER-${order.id}`;
    const amount = order.totalCents;
    const currency = order.currency;

    const params = new URLSearchParams({
      MerchantID: merchantId,
      MerchantPassword: merchantPassword,
      Amount: amount.toString(),
      Currency: currency,
      Reference: reference,
      Language: 'fr',
      Accepturl:
        process.env.MAXICASH_SUCCESS_URL ||
        `http://localhost:5173/commande-succes`,
      Declineurl:
        process.env.MAXICASH_FAILURE_URL || 'http://localhost:5173/panier',
      Cancelurl:
        process.env.MAXICASH_CANCEL_URL || 'http://localhost:5173/panier',
      Notifyurl:
        process.env.MAXICASH_NOTIFY_URL ||
        'http://localhost:3000/maxicash/notify',
    });

    if (order.user?.phoneNumber) {
      params.append('Telephone', order.user.phoneNumber);
    }

    const url = `${gatewayUrl}?${params.toString()}`;

    // Log the transaction attempt
    await this.prisma.maxicashTransaction.upsert({
      where: { reference },
      update: { status: 'INITIATED', rawPayload: { url } },
      create: {
        orderId,
        reference,
        amountCents: amount,
        currency,
        status: 'INITIATED',
        rawPayload: { url },
      },
    });

    return url;
  }

  /**
   * Idempotent webhook handler.
   * Duplicate notifications for an already-PAID order are safely ignored.
   */
  async handleNotification(payload: any): Promise<{ status: string }> {
    const reference = payload?.Reference as string | undefined;
    const maxiStatus = payload?.Status as string | undefined;
    const providerTxId = payload?.TransactionID as string | undefined;

    if (!reference || !reference.startsWith('ORDER-')) {
      this.logger.warn('MaxiCash webhook: unknown reference', payload);
      return { status: 'ignored' };
    }

    const orderId = parseInt(reference.replace('ORDER-', ''), 10);
    if (isNaN(orderId)) return { status: 'ignored' };

    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      this.logger.warn(`MaxiCash webhook: order #${orderId} not found`);
      return { status: 'ignored' };
    }

    // ── Idempotency guard ─────────────────────────────────────────────────
    if (order.paymentStatus === 'PAID') {
      this.logger.log(`MaxiCash webhook: order #${orderId} already PAID — skip`);
      return { status: 'already_processed' };
    }

    // ── Persist / update transaction record ───────────────────────────────
    await this.prisma.maxicashTransaction.upsert({
      where: { reference },
      update: {
        status: maxiStatus ?? 'UNKNOWN',
        providerTxId,
        rawPayload: payload,
        completedAt: new Date(),
      },
      create: {
        orderId,
        reference,
        amountCents: order.totalCents,
        currency: order.currency,
        status: maxiStatus ?? 'UNKNOWN',
        providerTxId,
        rawPayload: payload,
        completedAt: new Date(),
      },
    });

    // ── Apply state transitions ───────────────────────────────────────────
    if (maxiStatus === 'Success') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'PAID', status: 'CONFIRMED' },
      });

      await this.prisma.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: 'AWAITING_PAYMENT',
          toStatus: 'CONFIRMED',
          changedBy: 'WEBHOOK',
          reason: `MaxiCash TX: ${providerTxId}`,
        },
      });

      this.logger.log(`Order #${orderId}: CONFIRMED via MaxiCash webhook`);
    } else if (maxiStatus === 'Failed') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });

      await this.prisma.maxicashTransaction.update({
        where: { reference },
        data: { failureReason: payload?.FailureReason ?? 'MaxiCash: Failed' },
      });

      this.logger.warn(`Order #${orderId}: payment FAILED`);
    } else if (maxiStatus === 'Cancelled') {
      await this.prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'CANCELLED' },
      });

      this.logger.warn(`Order #${orderId}: payment CANCELLED by customer`);
    } else {
      this.logger.log(`Order #${orderId}: unhandled webhook status "${maxiStatus}"`);
    }

    return { status: 'acknowledged' };
  }
}
