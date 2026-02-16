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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxicashController = void 0;
const common_1 = require("@nestjs/common");
const maxicash_service_1 = require("./maxicash.service");
const notification_service_1 = require("../notification/notification.service");
const prisma_service_1 = require("../prisma/prisma.service");
let MaxicashController = class MaxicashController {
    constructor(maxicashService, notificationService, prisma) {
        this.maxicashService = maxicashService;
        this.notificationService = notificationService;
        this.prisma = prisma;
    }
    async initiate(body) {
        if (!body.orderId) {
            throw new common_1.BadRequestException('orderId is required');
        }
        const paymentUrl = await this.maxicashService.generatePaymentUrl(body.orderId);
        return { paymentUrl };
    }
    async notify(payload) {
        console.log('MaxiCash Notification received:', payload);
        const result = await this.maxicashService.handleNotification(payload);
        // If successful, create a notification for the admin
        if (payload.Status === 'Success') {
            const orderId = parseInt(payload.Reference.replace('ORDER-', ''), 10);
            const order = await this.prisma.order.findUnique({
                where: { id: orderId },
                include: { user: true },
            });
            await this.notificationService.create({
                title: 'Nouveau paiement reçu',
                message: `La commande #${orderId} de ${order?.user?.firstName || 'un client'} a été payée via MaxiCash.`,
                type: 'ORDER',
            });
        }
        return result;
    }
    // Some implementations might use GET for simple success redirects if NotifyUrl isn't used
    async success(query) {
        console.log('MaxiCash Success redirect:', query);
        return { message: 'Payment successful', query };
    }
};
exports.MaxicashController = MaxicashController;
__decorate([
    (0, common_1.Post)('initiate'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaxicashController.prototype, "initiate", null);
__decorate([
    (0, common_1.Post)('notify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaxicashController.prototype, "notify", null);
__decorate([
    (0, common_1.Get)('success'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MaxicashController.prototype, "success", null);
exports.MaxicashController = MaxicashController = __decorate([
    (0, common_1.Controller)('maxicash'),
    __metadata("design:paramtypes", [maxicash_service_1.MaxicashService,
        notification_service_1.NotificationService,
        prisma_service_1.PrismaService])
], MaxicashController);
