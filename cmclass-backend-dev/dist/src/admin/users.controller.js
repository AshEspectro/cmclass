"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const create_user_dto_1 = require("./dto/create-user.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const mail_service_1 = require("../mail/mail.service");
const notification_service_1 = require("../notification/notification.service");
let UsersController = class UsersController {
    constructor(prisma, mail, notificationService) {
        this.prisma = prisma;
        this.mail = mail;
        this.notificationService = notificationService;
    }
    async list(pageRaw, pageSizeRaw, search) {
        const page = Math.max(1, Number(pageRaw) || 1);
        const pageSize = Math.min(100, Number(pageSizeRaw) || 20);
        const skip = (page - 1) * pageSize;
        // Only return team members (not regular USERs)
        const where = {
            role: { not: 'USER' }
        };
        if (search) {
            where.AND = [
                { role: { not: 'USER' } },
                {
                    OR: [
                        { email: { contains: search, mode: 'insensitive' } },
                        { username: { contains: search, mode: 'insensitive' } },
                    ]
                }
            ];
        }
        const [users, total] = await Promise.all([
            this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
            this.prisma.user.count({ where }),
        ]);
        return {
            data: users.map((u) => {
                const { password, ...rest } = u;
                return rest;
            }),
            meta: { total, page, pageSize },
        };
    }
    async listClients(search) {
        const ASSET_BASE = process.env.PUBLIC_ASSET_URL || 'http://localhost:3000';
        const where = { role: 'USER' };
        if (search) {
            where.OR = [
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
            ];
        }
        const users = await this.prisma.user.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                wishlistItems: { include: { product: { include: { category: true } } } },
                cartItems: { include: { product: { include: { category: true } } } },
            },
        });
        const mapProduct = (product) => ({
            id: product.id,
            label: product.label || null,
            name: product.name,
            price: product.priceCents ? product.priceCents / 100 : 0,
            sizes: product.sizes || [],
            longDescription: product.longDescription || null,
            productImage: product.productImage || null,
            mannequinImage: product.mannequinImage || null,
            colors: product.colors ? (Array.isArray(product.colors) ? product.colors : JSON.parse(product.colors)) : [],
            images: product.images || [],
            inStock: product.inStock,
            categoryId: product.categoryId,
            category: product.category?.name || null,
        });
        const data = users.map((u) => {
            const { password, refreshToken, resetPasswordToken, resetPasswordExpires, ...rest } = u;
            return {
                ...rest,
                wishlist: u.wishlistItems.map((w) => mapProduct(w.product)),
                cart: u.cartItems.map((c) => ({
                    ...mapProduct(c.product),
                    quantity: c.quantity,
                    selectedSize: c.size || 'Unique',
                    selectedColor: c.color || '#000000',
                })),
            };
        });
        return { data, meta: { total: data.length } };
    }
    async create(req, dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.BadRequestException('Email already in use');
        const rawPassword = (0, crypto_1.randomBytes)(8).toString('hex');
        const hashed = await bcrypt.hash(rawPassword, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                username: dto.username,
                password: hashed,
                role: dto.role ?? 'USER',
                title: dto.title,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phoneCountryCode: dto.phoneCountryCode,
                phoneNumber: dto.phoneNumber,
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                marketingOptIn: dto.marketingOptIn ?? false,
                marketingEmails: dto.marketingEmails ?? false,
                marketingSms: dto.marketingSms ?? false,
                marketingTargetedAds: dto.marketingTargetedAds ?? false,
            },
        });
        const { password, ...rest } = user;
        // send invite email instead of returning temp password
        try {
            const sendRes = await this.mail.sendInviteEmail(user.email, user.username, rawPassword);
            if (process.env.NODE_ENV !== 'production') {
                // log and include send result for debugging in dev
                console.log('[DEV] Created user raw password:', rawPassword);
                console.log('[DEV] Mail send result:', sendRes);
            }
        }
        catch (err) {
            // don't block creation if email fails; log handled in MailService
        }
        const resp = { user: rest };
        if (process.env.NODE_ENV !== 'production') {
            resp.password = rawPassword; // convenience for dev testing
        }
        // Audit log
        try {
            await this.prisma.auditLog.create({ data: { actorId: req.user?.id ?? null, targetUserId: user.id, action: 'user.create', meta: { email: user.email, role: user.role } } });
        }
        catch (e) {
            console.error('Failed to write audit log', e);
        }
        return resp;
    }
    async update(req, id, dto) {
        const parsed = Number(id);
        if (Number.isNaN(parsed))
            throw new common_1.BadRequestException('Invalid id');
        const existing = await this.prisma.user.findUnique({ where: { id: parsed } });
        if (!existing)
            throw new common_1.NotFoundException('User not found');
        // If updating email, ensure uniqueness
        if (dto.email && dto.email !== existing.email) {
            const byEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
            if (byEmail)
                throw new common_1.BadRequestException('Email already in use');
        }
        // Role changes involving SUPER_ADMIN must be performed by SUPER_ADMIN
        if (dto.role === 'SUPER_ADMIN' || existing.role === 'SUPER_ADMIN') {
            const requesterRole = req.user?.role;
            if (requesterRole !== 'SUPER_ADMIN') {
                throw new common_1.ForbiddenException('Only SUPER_ADMIN can modify SUPER_ADMIN accounts or promote to SUPER_ADMIN');
            }
        }
        const updateData = { ...dto };
        if (dto.dateOfBirth) {
            updateData.dateOfBirth = new Date(dto.dateOfBirth);
        }
        const user = await this.prisma.user.update({ where: { id: parsed }, data: updateData });
        const { password, ...rest } = user;
        // Trigger notification if it's an admin user being updated
        if (user.role !== 'USER') {
            try {
                await this.notificationService.create({
                    title: 'Infos admin modifiées',
                    message: `Les informations du compte admin "${user.username}" (${user.email}) ont été mises à jour par ${req.user.username}.`,
                    type: 'ADMIN_UPDATE',
                });
            }
            catch (e) {
                console.error('Failed to create notification', e);
            }
        }
        // Audit
        try {
            await this.prisma.auditLog.create({ data: { actorId: req.user?.id ?? null, targetUserId: user.id, action: 'user.update', meta: dto } });
        }
        catch (e) {
            console.error('Failed to write audit log', e);
        }
        return rest;
    }
    async resetPassword(req, id, body) {
        const parsed = Number(id);
        if (Number.isNaN(parsed))
            throw new common_1.BadRequestException('Invalid id');
        const user = await this.prisma.user.findUnique({ where: { id: parsed } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const rawPassword = body?.password ?? (0, crypto_1.randomBytes)(8).toString('hex');
        const hashed = await bcrypt.hash(rawPassword, 10);
        const updated = await this.prisma.user.update({ where: { id: parsed }, data: { password: hashed } });
        try {
            await this.mail.sendInviteEmail(updated.email, updated.username, rawPassword);
        }
        catch (err) {
            // MailService logs errors; do not fail the request because of email problems
        }
        const resp = { success: true };
        if (process.env.NODE_ENV !== 'production')
            resp.password = rawPassword;
        // Audit
        try {
            await this.prisma.auditLog.create({ data: { actorId: req.user?.id ?? null, targetUserId: updated.id, action: 'user.reset_password', meta: { autogenerated: !body?.password } } });
        }
        catch (e) {
            console.error('Failed to write audit log', e);
        }
        return resp;
    }
    async remove(req, id) {
        const parsed = Number(id);
        if (Number.isNaN(parsed))
            throw new common_1.BadRequestException('Invalid id');
        try {
            const target = await this.prisma.user.findUnique({ where: { id: parsed } });
            if (!target)
                throw new common_1.NotFoundException('User not found');
            if (target.role === 'SUPER_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
                throw new common_1.ForbiddenException('Only SUPER_ADMIN can delete SUPER_ADMIN accounts');
            }
            // Create audit log BEFORE deleting the user to avoid foreign key constraint issues
            try {
                await this.prisma.auditLog.create({ data: { actorId: req.user?.id ?? null, targetUserId: parsed, action: 'user.delete', meta: {} } });
            }
            catch (e) {
                console.error('Failed to write audit log', e);
            }
            await this.prisma.user.delete({ where: { id: parsed } });
            return { success: true };
        }
        catch (err) {
            // Prisma P2025: Record to delete does not exist
            if (err instanceof client_1.Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
                throw new common_1.NotFoundException('User not found');
            }
            throw err;
        }
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('clients'),
    __param(0, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "listClients", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/reset-password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('admin/users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        notification_service_1.NotificationService])
], UsersController);
