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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const notification_service_1 = require("../notification/notification.service");
let OrdersController = class OrdersController {
    constructor(prisma, notificationService) {
        this.prisma = prisma;
        this.notificationService = notificationService;
    }
    async listMine(req) {
        const orders = await this.prisma.order.findMany({
            where: { userId: req.user.id },
            include: {
                items: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return {
            data: orders.map((order) => ({
                id: order.id,
                status: order.status,
                paymentStatus: order.paymentStatus,
                total: order.totalCents / 100,
                currency: order.currency,
                createdAt: order.createdAt,
                items: order.items.map((item) => ({
                    id: item.id,
                    productId: item.productId,
                    name: item.product?.name || `Produit ${item.productId}`,
                    quantity: item.quantity,
                    price: item.priceCents / 100,
                    size: item.size,
                    color: item.color,
                    image: item.product?.productImage || item.product?.mannequinImage || null,
                })),
            })),
        };
    }
    async createFromCart(req, body) {
        const cartItems = await this.prisma.cartItem.findMany({
            where: { userId: req.user.id },
            include: { product: true },
            orderBy: { createdAt: 'asc' },
        });
        if (cartItems.length === 0) {
            throw new common_1.BadRequestException('Cart is empty');
        }
        const totalCents = cartItems.reduce((sum, item) => {
            const priceCents = item.product?.priceCents || 0;
            return sum + priceCents * item.quantity;
        }, 0);
        const order = await this.prisma.order.create({
            data: {
                userId: req.user.id,
                status: 'PENDING',
                paymentStatus: body?.paymentStatus || 'PENDING',
                totalCents,
                items: {
                    create: cartItems.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        priceCents: item.product?.priceCents || 0,
                        size: item.size || '',
                        color: item.color || '',
                    })),
                },
            },
            include: { items: { include: { product: true } } },
        });
        // Notify admin about new order
        const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
        await this.notificationService.create({
            title: 'Nouvelle commande',
            message: `${user?.firstName || user?.username} a passé une commande (#${order.id}) pour ${totalCents / 100} ${order.currency}.`,
            type: 'ORDER',
        });
        // Check for low stock items
        for (const item of order.items) {
            if (item.product && item.product.stock <= 5) {
                await this.notificationService.create({
                    title: 'Stock faible',
                    message: `Le produit "${item.product.name}" est presque épuisé (${item.product.stock} restants).`,
                    type: 'STOCK',
                });
            }
        }
        await this.prisma.cartItem.deleteMany({ where: { userId: req.user.id } });
        return { data: order };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "listMine", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "createFromCart", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        notification_service_1.NotificationService])
], OrdersController);
