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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var PublicContactController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PublicContactController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const mail_service_1 = require("../mail/mail.service");
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
let PublicContactController = PublicContactController_1 = class PublicContactController {
    constructor(prisma, mailService) {
        this.prisma = prisma;
        this.mailService = mailService;
        this.logger = new common_1.Logger(PublicContactController_1.name);
    }
    async submit(body) {
        const name = typeof body?.name === 'string' ? body.name.trim() : '';
        const email = typeof body?.email === 'string' ? body.email.trim() : '';
        const subject = typeof body?.subject === 'string' ? body.subject.trim() : '';
        const message = typeof body?.message === 'string' ? body.message.trim() : '';
        if (!name)
            throw new common_1.BadRequestException('Le nom est requis.');
        if (!email || !EMAIL_REGEX.test(email))
            throw new common_1.BadRequestException('Email invalide.');
        if (!subject)
            throw new common_1.BadRequestException('Le sujet est requis.');
        if (!message || message.length < 5) {
            throw new common_1.BadRequestException('Le message est requis.');
        }
        if (name.length > 200 || email.length > 320 || subject.length > 200 || message.length > 5000) {
            throw new common_1.BadRequestException('Le message est trop long.');
        }
        const entry = await this.prisma.contactMessage.create({
            data: { name, email, subject, message },
        });
        const notifyTo = process.env.CONTACT_NOTIFY_EMAIL ||
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
            }
            catch (err) {
                this.logger.warn(`Failed to send contact notification: ${err.message}`);
            }
        }
        return { success: true, data: { id: entry.id } };
    }
};
exports.PublicContactController = PublicContactController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PublicContactController.prototype, "submit", null);
exports.PublicContactController = PublicContactController = PublicContactController_1 = __decorate([
    (0, common_1.Controller)('contact'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService])
], PublicContactController);
