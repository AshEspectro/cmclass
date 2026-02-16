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
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
let OrdersController = class OrdersController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list() {
        const orders = await this.prisma.order.findMany({
            include: {
                user: true,
                items: {
                    include: { product: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const statusMap = {
            PENDING: 'En Préparation',
            PROCESSING: 'En Préparation',
            SHIPPED: 'En Transit',
            DELIVERED: 'Livrée',
            CANCELLED: 'Annulée',
        };
        const paymentMap = {
            PENDING: 'En attente',
            PAID: 'Payée',
            REFUNDED: 'Remboursée',
        };
        const mapped = orders.map((order) => {
            const itemsCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return {
                id: `#CMD-${order.id}`,
                customer: `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim() || order.user?.username || order.user?.email || `Client ${order.userId}`,
                email: order.user?.email || '',
                date: order.createdAt.toISOString().slice(0, 10),
                total: order.totalCents / 100,
                status: statusMap[order.status] || 'En Préparation',
                items: itemsCount,
                payment: paymentMap[order.paymentStatus] || 'En attente',
                lines: order.items.map((item) => ({
                    name: item.product?.name || `Produit ${item.productId}`,
                    quantity: item.quantity,
                    price: item.priceCents / 100,
                    size: item.size || '',
                    color: item.color || '',
                    image: item.product?.productImage || null,
                })),
            };
        });
        const totalOrders = mapped.length;
        const pendingOrders = mapped.filter((o) => o.status === 'En Préparation').length;
        const inTransitOrders = mapped.filter((o) => o.status === 'En Transit').length;
        const totalRevenue = mapped.reduce((sum, o) => sum + o.total, 0);
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        return {
            stats: {
                totalOrders,
                pendingOrders,
                inTransitOrders,
                avgOrderValue,
            },
            orders: mapped,
        };
    }
    async updateStatus(id, body) {
        const order = await this.prisma.order.update({
            where: { id },
            data: { status: body.status },
        });
        return { data: order };
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "list", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "updateStatus", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('admin/orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], OrdersController);
