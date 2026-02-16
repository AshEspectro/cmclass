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
exports.DashboardController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const notification_service_1 = require("../notification/notification.service");
let DashboardController = class DashboardController {
    constructor(prisma, notifications) {
        this.prisma = prisma;
        this.notifications = notifications;
    }
    getMonthLabels() {
        return ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    }
    calcMoM(current, previous) {
        if (previous <= 0) {
            if (current > 0) {
                return { value: 100, trend: 'up' };
            }
            return { value: 0, trend: 'up' };
        }
        const diff = ((current - previous) / previous) * 100;
        const rounded = Math.round(diff * 10) / 10;
        return { value: rounded, trend: diff >= 0 ? 'up' : 'down' };
    }
    async getDashboard() {
        const [usersCount, ordersCount, productsCount, notifSummary] = await Promise.all([
            this.prisma.user.count({ where: { role: 'USER' } }),
            this.prisma.order.count({ where: { status: { not: 'CANCELLED' } } }),
            this.prisma.product.count(),
            this.notifications.summary().catch(() => ({ unread: 0, latest: [] })),
        ]);
        const orders = await this.prisma.order.findMany({
            where: { status: { not: 'CANCELLED' } },
            include: {
                items: {
                    include: { product: true },
                },
            },
        });
        const now = new Date();
        const currentWindowStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const previousWindowStart = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        const [currentOrdersAgg, prevOrdersAgg, currentUsersCount, prevUsersCount, currentProductsCount, prevProductsCount,] = await Promise.all([
            this.prisma.order.aggregate({
                _sum: { totalCents: true },
                _count: { _all: true },
                where: { status: { not: 'CANCELLED' }, createdAt: { gte: currentWindowStart } },
            }),
            this.prisma.order.aggregate({
                _sum: { totalCents: true },
                _count: { _all: true },
                where: {
                    status: { not: 'CANCELLED' },
                    createdAt: { gte: previousWindowStart, lt: currentWindowStart },
                },
            }),
            this.prisma.user.count({ where: { role: 'USER', createdAt: { gte: currentWindowStart } } }),
            this.prisma.user.count({
                where: { role: 'USER', createdAt: { gte: previousWindowStart, lt: currentWindowStart } },
            }),
            this.prisma.product.count({ where: { createdAt: { gte: currentWindowStart } } }),
            this.prisma.product.count({ where: { createdAt: { gte: previousWindowStart, lt: currentWindowStart } } }),
        ]);
        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalCents || 0) / 100, 0);
        const conversionRate = usersCount > 0 ? (ordersCount / usersCount) * 100 : 0;
        // Sales data for the last 6 months (based on orders)
        const months = [];
        for (let i = 5; i >= 0; i -= 1) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push(d);
        }
        const start = new Date(months[0].getFullYear(), months[0].getMonth(), 1);
        const recentOrders = orders.filter((order) => order.createdAt >= start);
        const labels = this.getMonthLabels();
        const monthKey = (date) => `${date.getFullYear()}-${date.getMonth()}`;
        const salesMap = new Map();
        for (const m of months) {
            salesMap.set(monthKey(m), { revenue: 0, orders: 0 });
        }
        for (const order of recentOrders) {
            const key = monthKey(order.createdAt);
            const entry = salesMap.get(key);
            if (!entry)
                continue;
            entry.revenue += (order.totalCents || 0) / 100;
            entry.orders += 1;
        }
        const salesData = months.map((m) => ({
            month: labels[m.getMonth()],
            revenue: Number(salesMap.get(monthKey(m))?.revenue || 0),
            orders: Number(salesMap.get(monthKey(m))?.orders || 0),
        }));
        // Top products by order items
        const productMap = new Map();
        for (const order of orders) {
            for (const item of order.items) {
                if (!item.productId)
                    continue;
                const id = item.productId;
                const name = item.product?.name || `Produit ${id}`;
                const entry = productMap.get(id) || { name, sales: 0, revenue: 0 };
                entry.sales += item.quantity || 0;
                entry.revenue += ((item.priceCents || 0) * (item.quantity || 1)) / 100;
                productMap.set(id, entry);
            }
        }
        const topProducts = Array.from(productMap.values())
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 5);
        // Content alerts
        const [missingDescription, missingImage, draftCampaigns] = await Promise.all([
            this.prisma.product.count({ where: { description: null } }),
            this.prisma.product.count({ where: { productImage: null } }),
            this.prisma.campaign.count({ where: { status: 'Brouillon' } }),
        ]);
        const contentAlerts = [];
        if (missingDescription > 0) {
            contentAlerts.push({
                type: 'Description Produit',
                message: `${missingDescription} produits sans description`,
                priority: missingDescription > 5 ? 'high' : 'medium',
            });
        }
        if (missingImage > 0) {
            contentAlerts.push({
                type: 'Images Produit',
                message: `${missingImage} produits sans image principale`,
                priority: missingImage > 5 ? 'high' : 'medium',
            });
        }
        if (draftCampaigns > 0) {
            contentAlerts.push({
                type: 'Campagnes',
                message: `${draftCampaigns} campagnes en brouillon`,
                priority: draftCampaigns > 3 ? 'medium' : 'low',
            });
        }
        if (contentAlerts.length === 0) {
            contentAlerts.push({
                type: 'Contenu',
                message: 'Tout est à jour',
                priority: 'low',
            });
        }
        const revenueCurrent = (currentOrdersAgg._sum.totalCents || 0) / 100;
        const revenuePrev = (prevOrdersAgg._sum.totalCents || 0) / 100;
        const ordersCurrent = currentOrdersAgg._count._all || 0;
        const ordersPrev = prevOrdersAgg._count._all || 0;
        const conversionCurrent = currentUsersCount > 0 ? (ordersCurrent / currentUsersCount) * 100 : 0;
        const conversionPrev = prevUsersCount > 0 ? (ordersPrev / prevUsersCount) * 100 : 0;
        return {
            stats: {
                totalRevenue,
                totalOrders: ordersCount,
                totalCustomers: usersCount,
                conversionRate,
                totalProducts: productsCount,
            },
            mom: {
                totalRevenue: this.calcMoM(revenueCurrent, revenuePrev),
                totalOrders: this.calcMoM(ordersCurrent, ordersPrev),
                totalCustomers: this.calcMoM(currentUsersCount, prevUsersCount),
                totalProducts: this.calcMoM(currentProductsCount, prevProductsCount),
                conversionRate: this.calcMoM(conversionCurrent, conversionPrev),
            },
            salesData,
            topProducts,
            contentAlerts,
            notifications: notifSummary?.latest || [],
            unreadNotifications: notifSummary?.unread || 0,
        };
    }
};
exports.DashboardController = DashboardController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DashboardController.prototype, "getDashboard", null);
exports.DashboardController = DashboardController = __decorate([
    (0, common_1.Controller)('admin/dashboard'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, notification_service_1.NotificationService])
], DashboardController);
