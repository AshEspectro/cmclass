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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaxicashService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let MaxicashService = class MaxicashService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async generatePaymentUrl(orderId) {
        const order = await this.prisma.order.findUnique({
            where: { id: orderId },
            include: { user: true },
        });
        if (!order) {
            throw new Error('Order not found');
        }
        const merchantId = process.env.MAXICASH_MERCHANT_ID || '';
        const merchantPassword = process.env.MAXICASH_MERCHANT_PASSWORD || '';
        const gatewayUrl = process.env.MAXICASH_GATEWAY_URL || 'https://sandbox.maxicashapp.com/PayNow';
        // MaxiCash expects amount in cents
        const amount = order.totalCents;
        const currency = order.currency;
        const reference = `ORDER-${order.id}`;
        const params = new URLSearchParams({
            MerchantID: merchantId,
            MerchantPassword: merchantPassword,
            Amount: amount.toString(),
            Currency: currency,
            Reference: reference,
            Language: 'fr', // or 'en'
            Accepturl: process.env.MAXICASH_SUCCESS_URL || 'http://localhost:5173/suivi',
            Declineurl: process.env.MAXICASH_FAILURE_URL || 'http://localhost:5173/panier',
            Cancelurl: process.env.MAXICASH_CANCEL_URL || 'http://localhost:5173/panier',
            Notifyurl: process.env.MAXICASH_NOTIFY_URL || 'http://localhost:3000/maxicash/notify',
        });
        // If we have user's phone, we can pre-fill it (though PayNow usually asks for it if not provided)
        if (order.user?.phoneNumber) {
            params.append('Telephone', order.user.phoneNumber);
        }
        return `${gatewayUrl}?${params.toString()}`;
    }
    async handleNotification(payload) {
        // MaxiCash sends notification with transaction result
        // Payload usually contains Reference, Status, TransactionID, etc.
        const reference = payload.Reference;
        const status = payload.Status; // e.g., 'Success' or 'Failed'
        if (reference && reference.startsWith('ORDER-')) {
            const orderId = parseInt(reference.replace('ORDER-', ''), 10);
            if (status === 'Success') {
                await this.prisma.order.update({
                    where: { id: orderId },
                    data: {
                        paymentStatus: 'PAID',
                        status: 'PROCESSING', // Move to processing after payment
                    },
                });
                // Trigger notification for admin
                // (This will be called from the controller which has access to NotificationService)
            }
        }
        return { status: 'acknowledged' };
    }
};
exports.MaxicashService = MaxicashService;
exports.MaxicashService = MaxicashService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MaxicashService);
