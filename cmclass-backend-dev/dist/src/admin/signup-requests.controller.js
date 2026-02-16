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
exports.SignupRequestsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const mail_service_1 = require("../mail/mail.service");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const notification_service_1 = require("../notification/notification.service");
let SignupRequestsController = class SignupRequestsController {
    constructor(prisma, mail, notificationService) {
        this.prisma = prisma;
        this.mail = mail;
        this.notificationService = notificationService;
    }
    async list() {
        // return only pending requests so processed ones are not shown in the admin UI
        const data = await this.prisma.signupRequest.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } });
        return { data };
    }
    async count() {
        const count = await this.prisma.signupRequest.count({ where: { status: 'PENDING' } });
        return { count };
    }
    async approve(req, id, body) {
        const parsed = Number(id);
        if (Number.isNaN(parsed))
            throw new common_1.BadRequestException('Invalid id');
        const sr = await this.prisma.signupRequest.findUnique({ where: { id: parsed } });
        if (!sr)
            throw new common_1.BadRequestException('Signup request not found');
        if (sr.status !== 'PENDING')
            throw new common_1.BadRequestException('Request already processed');
        const emailExists = await this.prisma.user.findUnique({ where: { email: sr.email } });
        if (emailExists)
            throw new common_1.BadRequestException('Email already in use');
        // Use supplied password if the user provided one, otherwise generate a random password
        const rawPassword = sr.password && sr.password.length > 0 ? sr.password : (0, crypto_1.randomBytes)(8).toString('hex');
        const hashed = await bcrypt.hash(rawPassword, 10);
        const roleToAssign = body?.role ?? 'USER'; // Ignore the roleRequested, use admin selection
        const username = sr.name.replace(/\s+/g, '').toLowerCase();
        const user = await this.prisma.user.create({ data: { email: sr.email, username, password: hashed, role: roleToAssign } });
        // Mark request processed and clear sensitive password field
        await this.prisma.signupRequest.update({ where: { id: parsed }, data: { status: 'APPROVED', processedAt: new Date(), processedById: req.user?.sub ?? null, password: null } });
        await this.notificationService.create({
            title: 'Demande d\'admin approuvée',
            message: `La demande de ${sr.name} (${sr.email}) a été approuvée par ${req.user.username}.`,
            type: 'SIGNUP_APPROVE',
        });
        try {
            await this.mail.sendApprovalEmail(user.email, user.username, rawPassword, roleToAssign);
        }
        catch (err) {
            // log and continue
            console.error('Failed to send approval email', err);
        }
        try {
            await this.prisma.auditLog.create({ data: { actorId: req.user?.sub ?? null, targetUserId: user.id, action: 'signup.approve', meta: { signupRequestId: sr.id } } });
        }
        catch (e) {
            console.error('Failed to write audit log', e);
        }
        return { user: { id: user.id, email: user.email, username: user.username } };
    }
    async deny(req, id, body) {
        const parsed = Number(id);
        if (Number.isNaN(parsed))
            throw new common_1.BadRequestException('Invalid id');
        const sr = await this.prisma.signupRequest.findUnique({ where: { id: parsed } });
        if (!sr)
            throw new common_1.BadRequestException('Signup request not found');
        if (sr.status !== 'PENDING')
            throw new common_1.BadRequestException('Request already processed');
        await this.prisma.signupRequest.update({ where: { id: parsed }, data: { status: 'DENIED', processedAt: new Date(), processedById: req.user?.sub ?? null } });
        try {
            await this.mail.sendDenialEmail(sr.email, sr.name);
        }
        catch (err) {
            console.error('Failed to send denial email', err);
        }
        try {
            await this.prisma.auditLog.create({ data: { actorId: req.user?.sub ?? null, action: 'signup.deny', meta: { signupRequestId: sr.id, reason: body?.reason } } });
        }
        catch (e) {
            console.error('Failed to write audit log', e);
        }
        return { success: true };
    }
    async remove(id) {
        const parsed = Number(id);
        if (Number.isNaN(parsed))
            throw new common_1.BadRequestException('Invalid id');
        await this.prisma.signupRequest.delete({ where: { id: parsed } });
        return { success: true };
    }
};
exports.SignupRequestsController = SignupRequestsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SignupRequestsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('count'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SignupRequestsController.prototype, "count", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SignupRequestsController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/deny'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SignupRequestsController.prototype, "deny", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SignupRequestsController.prototype, "remove", null);
exports.SignupRequestsController = SignupRequestsController = __decorate([
    (0, common_1.Controller)('admin/signup-requests'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        mail_service_1.MailService,
        notification_service_1.NotificationService])
], SignupRequestsController);
