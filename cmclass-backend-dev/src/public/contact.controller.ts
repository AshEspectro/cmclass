import { Body, BadRequestException, Controller, Logger, Post } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

type ContactPayload = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Controller('contact')
export class PublicContactController {
  private logger = new Logger(PublicContactController.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  @Post()
  async submit(@Body() body: ContactPayload) {
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim() : '';
    const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
    const message = typeof body?.message === 'string' ? body.message.trim() : '';

    if (!name) throw new BadRequestException('Le nom est requis.');
    if (!email || !EMAIL_REGEX.test(email)) throw new BadRequestException('Email invalide.');
    if (!subject) throw new BadRequestException('Le sujet est requis.');
    if (!message || message.length < 5) {
      throw new BadRequestException('Le message est requis.');
    }
    if (name.length > 200 || email.length > 320 || subject.length > 200 || message.length > 5000) {
      throw new BadRequestException('Le message est trop long.');
    }

    const entry = await this.prisma.contactMessage.create({
      data: { name, email, subject, message },
    });

    const notifyTo =
      process.env.CONTACT_NOTIFY_EMAIL ||
      process.env.SUPERADMIN_EMAIL ||
      process.env.EMAIL_FROM;

    if (notifyTo) {
      try {
        await this.mailService.sendContactNotification(notifyTo, {
          id: entry.id,
          name,
          email,
          subject,
          message,
        });
      } catch (err) {
        this.logger.warn(`Failed to send contact notification: ${(err as Error).message}`);
      }
    }

    return { success: true, data: { id: entry.id } };
  }
}
