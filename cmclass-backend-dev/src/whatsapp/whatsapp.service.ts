import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const twilio = require('twilio');

/**
 * WhatsappService — sends notifications via Twilio WhatsApp API.
 *
 * Required env vars (when WHATSAPP_ENABLED=true):
 *   WHATSAPP_ENABLED=true
 *   TWILIO_ACCOUNT_SID=ACxxxxxxxx
 *   TWILIO_AUTH_TOKEN=xxxxxxxx
 *   TWILIO_WHATSAPP_FROM=whatsapp:+1234567890
 *   APP_NAME=CM Class          (optional, defaults to "CM Class")
 *
 * If WHATSAPP_ENABLED is not "true", calls are silently no-ops
 * and the notification is logged as FAILED with a descriptive reason.
 */
@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);
  private readonly enabled: boolean;

  constructor(private prisma: PrismaService) {
    this.enabled = process.env.WHATSAPP_ENABLED === 'true';
  }

  /**
   * Send an ORDER_READY WhatsApp notification to the order customer.
   * Creates an OrderNotification record and updates it after the attempt.
   * Always resolves — never throws — so callers are never blocked.
   */
  async sendOrderReadyNotification(orderId: number): Promise<void> {
    // Load the order + user
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { user: true },
    });

    if (!order) {
      this.logger.warn(`sendOrderReadyNotification: order #${orderId} not found`);
      return;
    }

    // Determine recipient phone
    const phone = order.user?.phoneNumber;
    const fullPhone = phone
      ? `${order.user?.phoneCountryCode ?? ''}${phone}`.replace(/\s+/g, '')
      : null;

    const pickupExpiresStr = order.pickupExpiresAt
      ? new Date(order.pickupExpiresAt).toLocaleString('fr-FR', {
          day: '2-digit', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit',
        })
      : 'prochainement';

    const appName = process.env.APP_NAME || 'CM Class';
    const firstName = order.user?.firstName || 'Client';

    const messageBody = [
      `Bonjour ${firstName} 👋`,
      ``,
      `Votre commande *#${order.id}* est prête à être retirée en boutique 🛍️`,
      ``,
      `📌 *Code de retrait :* ${order.pickupCode ?? 'voir votre commande'}`,
      `⏰ *À retirer avant le :* ${pickupExpiresStr}`,
      ``,
      `Présentez ce message ou votre code à notre équipe en boutique.`,
      ``,
      `Merci de votre confiance,`,
      `*${appName}*`,
    ].join('\n');

    // Persist notification record (PENDING)
    const notif = await this.prisma.orderNotification.create({
      data: {
        orderId,
        type: 'ORDER_READY',
        channel: 'WHATSAPP',
        status: 'PENDING',
        payload: { to: fullPhone, body: messageBody },
      },
    });

    // Guard: no phone number
    if (!fullPhone) {
      await this.prisma.orderNotification.update({
        where: { id: notif.id },
        data: {
          status: 'FAILED',
          errorMessage: 'No phone number on user account',
        },
      });
      this.logger.warn(`Order #${orderId}: no phone number — WhatsApp skipped`);
      return;
    }

    // Guard: not enabled
    if (!this.enabled) {
      await this.prisma.orderNotification.update({
        where: { id: notif.id },
        data: {
          status: 'FAILED',
          errorMessage: 'WHATSAPP_ENABLED is not set to true',
        },
      });
      this.logger.warn(`Order #${orderId}: WHATSAPP_ENABLED=false — skipped`);
      return;
    }

    // Attempt send via Twilio
    try {
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID!,
        process.env.TWILIO_AUTH_TOKEN!,
      );

      const message = await client.messages.create({
        from: process.env.TWILIO_WHATSAPP_FROM,
        to: `whatsapp:${fullPhone}`,
        body: messageBody,
      });

      await this.prisma.orderNotification.update({
        where: { id: notif.id },
        data: {
          status: 'SENT',
          providerMessageId: message.sid,
          sentAt: new Date(),
        },
      });

      this.logger.log(`Order #${orderId}: WhatsApp sent (${message.sid})`);
    } catch (err: any) {
      await this.prisma.orderNotification.update({
        where: { id: notif.id },
        data: {
          status: 'FAILED',
          errorMessage: err?.message || 'Unknown Twilio error',
        },
      });
      this.logger.error(`Order #${orderId}: WhatsApp failed — ${err?.message}`);
    }
  }

  /**
   * Retry a failed ORDER_READY notification for an order.
   * Returns false if the latest notification is already SENT.
   */
  async retryOrderReadyNotification(orderId: number): Promise<{ retried: boolean; reason?: string }> {
    const latest = await this.prisma.orderNotification.findFirst({
      where: { orderId, type: 'ORDER_READY' },
      orderBy: { createdAt: 'desc' },
    });

    if (latest?.status === 'SENT') {
      return { retried: false, reason: 'already_sent' };
    }

    // Fire-and-forget
    this.sendOrderReadyNotification(orderId).catch(() => {});
    return { retried: true };
  }
}
