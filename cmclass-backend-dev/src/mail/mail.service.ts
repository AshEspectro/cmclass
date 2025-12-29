import { Injectable, Logger } from '@nestjs/common';
import nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter | null = null;
  private logger = new Logger(MailService.name);

  constructor() {
    // If SENDGRID_API_KEY is provided, prefer SendGrid SMTP via nodemailer
    const sgKey = process.env.SENDGRID_API_KEY;
    if (sgKey) {
      this.logger.log('SENDGRID_API_KEY detected — configuring SendGrid SMTP transport');
      this.transporter = nodemailer.createTransport({
        host: process.env.SENDGRID_SMTP_HOST || 'smtp.sendgrid.net',
        port: process.env.SENDGRID_SMTP_PORT ? Number(process.env.SENDGRID_SMTP_PORT) : 587,
        secure: (process.env.SENDGRID_SMTP_PORT ? Number(process.env.SENDGRID_SMTP_PORT) : 587) === 465,
        auth: { user: process.env.SENDGRID_SMTP_USER || 'apikey', pass: sgKey },
      });
      return;
    }
    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !port || !user || !pass) {
      this.logger.warn('SMTP not fully configured; will use Ethereal test account for dev when sending');
      this.transporter = null;
    } else {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }
  }

  async sendInviteEmail(to: string, username: string, tempPassword: string) {
    const from = process.env.EMAIL_FROM || 'espectro.ash@gmail.com';
    const subject = 'Invitation to Cmclass Admin';
    const text = `Bonjour ${username},\n\nVous avez été invité(e) à rejoindre le tableau de bord Cmclass.\n\nUtilisez ces identifiants temporaires pour vous connecter :\n\nemail: ${to}\nmot de passe: ${tempPassword}\n\nMerci.`;

    try {
      if (!this.transporter) {
        const testAccount = await nodemailer.createTestAccount();
        this.transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: { user: testAccount.user, pass: testAccount.pass },
        });
        this.logger.log(`Using Ethereal test account ${testAccount.user}`);
      }

      const info = await this.transporter.sendMail({ from, to, subject, text });
      this.logger.log(`Invite email sent to ${to}`);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) this.logger.log(`Preview email at: ${preview}`);
      return { success: true, provider: 'smtp', info, preview };
    } catch (err) {
      this.logger.error('Failed to send invite email', err as any);
      return { success: false, error: err };
    }
  }
}
