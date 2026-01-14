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

    // Skip email if no transporter configured and not in production
    if (!this.transporter && process.env.NODE_ENV !== 'production') {
      this.logger.warn(`Skipping invite email to ${to} (no SMTP configured)`);
      return { success: true, skipped: true };
    }

    try {
      if (!this.transporter) {
        this.logger.warn('No email transporter configured');
        return { success: false, error: 'No email transporter' };
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

  async sendSignupNotification(to: string, req: any) {
    const from = process.env.EMAIL_FROM || 'espectro.ash@gmail.com';
    const subject = `Nouvelle demande d'inscription: ${req.email}`;
    const adminUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/team-access`;
    const text = `Bonjour,\n\nUne nouvelle demande d'inscription a été soumise:\n\nNom: ${req.name}\nEmail: ${req.email}\nRôle demandé: ${req.roleRequested}\n\nMessage: ${req.message || '(aucun)'}\n\nAccédez au tableau de bord pour approuver ou refuser: ${adminUrl}\n\nMerci.`;

    // Skip email if no transporter configured and not in production
    if (!this.transporter && process.env.NODE_ENV !== 'production') {
      this.logger.warn(`Skipping signup notification email to ${to} (no SMTP configured)`);
      return { success: true, skipped: true };
    }

    try {
      if (!this.transporter) {
        this.logger.warn('No email transporter configured');
        return { success: false, error: 'No email transporter' };
      }

      const info = await this.transporter.sendMail({ from, to, subject, text });
      this.logger.log(`Signup notification email sent to ${to}`);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) this.logger.log(`Preview email at: ${preview}`);
      return { success: true, provider: 'smtp', info, preview };
    } catch (err) {
      this.logger.error('Failed to send signup notification', err as any);
      return { success: false, error: err };
    }
  }

  async sendApprovalEmail(to: string, username: string, tempPassword: string, role?: string) {
    const from = process.env.EMAIL_FROM || 'espectro.ash@gmail.com';
    const subject = "Votre demande d'inscription a été approuvée";
    const text = `Bonjour ${username},\n\nVotre demande d'inscription a été approuvée. Votre rôle: ${role || 'USER'}. Vous pouvez vous connecter avec :\n\nemail: ${to}\nmot de passe: ${tempPassword}\n\nMerci.`;

    // Skip email if no transporter configured and not in production
    if (!this.transporter && process.env.NODE_ENV !== 'production') {
      this.logger.warn(`Skipping approval email to ${to} (no SMTP configured)`);
      return { success: true, skipped: true };
    }

    try {
      if (!this.transporter) {
        this.logger.warn('No email transporter configured');
        return { success: false, error: 'No email transporter' };
      }

      const info = await this.transporter.sendMail({ from, to, subject, text });
      this.logger.log(`Approval email sent to ${to}`);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) this.logger.log(`Preview email at: ${preview}`);
      return { success: true, provider: 'smtp', info, preview };
    } catch (err) {
      this.logger.error('Failed to send approval email', err as any);
      return { success: false, error: err };
    }
  }

  async sendDenialEmail(to: string, name: string) {
    const from = process.env.EMAIL_FROM || 'espectro.ash@gmail.com';
    const subject = "Votre demande d'inscription a été refusée";
    const text = `Bonjour ${name},\n\nNous sommes désolés, mais votre demande d'inscription a été refusée. Si vous pensez qu'il s'agit d'une erreur, contactez le support.`;

    // Skip email if no transporter configured and not in production
    if (!this.transporter && process.env.NODE_ENV !== 'production') {
      this.logger.warn(`Skipping denial email to ${to} (no SMTP configured)`);
      return { success: true, skipped: true };
    }

    try {
      if (!this.transporter) {
        this.logger.warn('No email transporter configured');
        return { success: false, error: 'No email transporter' };
      }

      const info = await this.transporter.sendMail({ from, to, subject, text });
      this.logger.log(`Denial email sent to ${to}`);
      const preview = nodemailer.getTestMessageUrl(info);
      if (preview) this.logger.log(`Preview email at: ${preview}`);
      return { success: true, provider: 'smtp', info, preview };
    } catch (err) {
      this.logger.error('Failed to send denial email', err as any);
      return { success: false, error: err };
    }
  }
}
