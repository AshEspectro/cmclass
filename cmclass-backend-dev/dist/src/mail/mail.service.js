"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var MailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailService = void 0;
const common_1 = require("@nestjs/common");
const nodemailer_1 = __importDefault(require("nodemailer"));
let MailService = MailService_1 = class MailService {
    constructor() {
        this.transporter = null;
        this.logger = new common_1.Logger(MailService_1.name);
        // If SENDGRID_API_KEY is provided, prefer SendGrid SMTP via nodemailer
        const sgKey = process.env.SENDGRID_API_KEY;
        if (sgKey) {
            this.logger.log('SENDGRID_API_KEY detected — configuring SendGrid SMTP transport');
            this.transporter = nodemailer_1.default.createTransport({
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
        }
        else {
            this.transporter = nodemailer_1.default.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
        }
    }
    async sendInviteEmail(to, username, tempPassword) {
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
            const preview = nodemailer_1.default.getTestMessageUrl(info);
            if (preview)
                this.logger.log(`Preview email at: ${preview}`);
            return { success: true, provider: 'smtp', info, preview };
        }
        catch (err) {
            this.logger.error('Failed to send invite email', err);
            return { success: false, error: err };
        }
    }
    async sendSignupNotification(to, req) {
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
            const preview = nodemailer_1.default.getTestMessageUrl(info);
            if (preview)
                this.logger.log(`Preview email at: ${preview}`);
            return { success: true, provider: 'smtp', info, preview };
        }
        catch (err) {
            this.logger.error('Failed to send signup notification', err);
            return { success: false, error: err };
        }
    }
    async sendContactNotification(to, payload) {
        const from = process.env.EMAIL_FROM || 'espectro.ash@gmail.com';
        const subject = `Nouveau message de contact: ${payload.subject || 'Sans sujet'}`;
        const text = `Bonjour,\n\nUn nouveau message de contact a été reçu:\n\nID: ${payload.id ?? 'n/a'}\nNom: ${payload.name}\nEmail: ${payload.email}\nSujet: ${payload.subject}\n\nMessage:\n${payload.message}\n\nMerci.`;
        // Skip email if no transporter configured and not in production
        if (!this.transporter && process.env.NODE_ENV !== 'production') {
            this.logger.warn(`Skipping contact notification email to ${to} (no SMTP configured)`);
            return { success: true, skipped: true };
        }
        try {
            if (!this.transporter) {
                this.logger.warn('No email transporter configured');
                return { success: false, error: 'No email transporter' };
            }
            const info = await this.transporter.sendMail({ from, to, subject, text });
            this.logger.log(`Contact notification email sent to ${to}`);
            const preview = nodemailer_1.default.getTestMessageUrl(info);
            if (preview)
                this.logger.log(`Preview email at: ${preview}`);
            return { success: true, provider: 'smtp', info, preview };
        }
        catch (err) {
            this.logger.error('Failed to send contact notification', err);
            return { success: false, error: err };
        }
    }
    async sendApprovalEmail(to, username, tempPassword, role) {
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
            const preview = nodemailer_1.default.getTestMessageUrl(info);
            if (preview)
                this.logger.log(`Preview email at: ${preview}`);
            return { success: true, provider: 'smtp', info, preview };
        }
        catch (err) {
            this.logger.error('Failed to send approval email', err);
            return { success: false, error: err };
        }
    }
    async sendDenialEmail(to, name) {
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
            const preview = nodemailer_1.default.getTestMessageUrl(info);
            if (preview)
                this.logger.log(`Preview email at: ${preview}`);
            return { success: true, provider: 'smtp', info, preview };
        }
        catch (err) {
            this.logger.error('Failed to send denial email', err);
            return { success: false, error: err };
        }
    }
    async sendEmailVerification(to, name, verifyUrl) {
        const from = process.env.EMAIL_FROM || 'espectro.ash@gmail.com';
        const subject = "Vérifiez votre adresse e-mail";
        const displayName = name || to;
        const text = `Bonjour ${displayName},\n\nMerci pour votre inscription. Veuillez confirmer votre adresse e-mail en cliquant sur le lien suivant :\n\n${verifyUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.\n\nMerci.`;
        if (!this.transporter && process.env.NODE_ENV !== 'production') {
            this.logger.warn(`Skipping verification email to ${to} (no SMTP configured)`);
            this.logger.warn(`Verification link: ${verifyUrl}`);
            return { success: true, skipped: true };
        }
        try {
            if (!this.transporter) {
                this.logger.warn('No email transporter configured');
                return { success: false, error: 'No email transporter' };
            }
            const info = await this.transporter.sendMail({ from, to, subject, text });
            this.logger.log(`Verification email sent to ${to}`);
            const preview = nodemailer_1.default.getTestMessageUrl(info);
            if (preview)
                this.logger.log(`Preview email at: ${preview}`);
            return { success: true, provider: 'smtp', info, preview };
        }
        catch (err) {
            this.logger.error('Failed to send verification email', err);
            return { success: false, error: err };
        }
    }
};
exports.MailService = MailService;
exports.MailService = MailService = MailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], MailService);
