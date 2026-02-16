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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
const crypto = __importStar(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const mail_service_1 = require("../mail/mail.service");
const notification_service_1 = require("../notification/notification.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, mail, notificationService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.mail = mail;
        this.notificationService = notificationService;
    }
    getGoogleClient() {
        const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
        return new google_auth_library_1.OAuth2Client(clientId);
    }
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            return null;
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return null;
        // do not return password
        const { password: _p, ...rest } = user;
        return rest;
    }
    async login(email, password, remember = false) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (!user.emailVerified)
            throw new common_1.UnauthorizedException('Email not verified');
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = { sub: user.id, username: user.username, role: user.role };
        const access_token = this.jwtService.sign(payload);
        if (!remember)
            return { access_token };
        // generate refresh token (long lived)
        const refresh_token = this.jwtService.sign(payload, { expiresIn: '30d' });
        // store hashed refresh token in DB
        const hashedRefresh = await bcrypt.hash(refresh_token, 10);
        await this.prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });
        return { access_token, refresh_token };
    }
    async adminLogin(email, password, remember = false) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        // Enforce admin roles
        const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT'];
        if (!allowedRoles.includes(user.role)) {
            throw new common_1.UnauthorizedException('Access denied. Administrator privileges required.');
        }
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const payload = { sub: user.id, username: user.username, role: user.role };
        const access_token = this.jwtService.sign(payload);
        if (!remember)
            return { access_token };
        const refresh_token = this.jwtService.sign(payload, { expiresIn: '30d' });
        const hashedRefresh = await bcrypt.hash(refresh_token, 10);
        await this.prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });
        return { access_token, refresh_token };
    }
    async refresh(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const userId = payload?.sub;
            if (!userId)
                throw new common_1.UnauthorizedException('Invalid refresh token');
            const user = await this.prisma.user.findUnique({ where: { id: userId } });
            if (!user || !user.refreshToken)
                throw new common_1.UnauthorizedException('No refresh token stored');
            const ok = await bcrypt.compare(refreshToken, user.refreshToken);
            if (!ok)
                throw new common_1.UnauthorizedException('Invalid refresh token');
            const newAccess = this.jwtService.sign({ sub: user.id, username: user.username, role: user.role });
            return { access_token: newAccess };
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
    }
    async oauthLogin(provider, token, remember = false) {
        if (provider !== 'google')
            throw new common_1.BadRequestException('Unsupported provider');
        const client = this.getGoogleClient();
        let payload;
        try {
            const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
            payload = ticket.getPayload();
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
        const email = payload?.email;
        if (!email)
            throw new common_1.UnauthorizedException('Google token did not contain email');
        let user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) {
            const usernameBase = (payload?.name || email.split('@')[0]).replace(/\s+/g, '').toLowerCase();
            const randomSuffix = crypto.randomBytes(3).toString('hex');
            const username = `${usernameBase}${randomSuffix}`;
            const randomPassword = crypto.randomBytes(16).toString('hex');
            const hashed = await bcrypt.hash(randomPassword, 10);
            user = await this.prisma.user.create({ data: { username, email, password: hashed, emailVerified: true } });
        }
        else if (!user.emailVerified) {
            user = await this.prisma.user.update({
                where: { id: user.id },
                data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
            });
        }
        const access_token = this.jwtService.sign({ sub: user.id, username: user.username, role: user.role });
        if (!remember)
            return { access_token };
        const refresh_token = this.jwtService.sign({ sub: user.id, username: user.username, role: user.role }, { expiresIn: '30d' });
        const hashedRefresh = await bcrypt.hash(refresh_token, 10);
        await this.prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });
        return { access_token, refresh_token };
    }
    async generatePasswordResetToken(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const token = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
        await this.prisma.user.update({ where: { id: user.id }, data: { resetPasswordToken: hashedToken, resetPasswordExpires: expires } });
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        console.log('Password reset link:', resetUrl);
        return { message: 'Password reset token generated', resetUrl };
    }
    async resetPassword(token, newPassword) {
        if (!token || !newPassword)
            throw new common_1.BadRequestException('token and newPassword required');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await this.prisma.user.findFirst({ where: { resetPasswordToken: hashedToken, resetPasswordExpires: { gt: new Date() } } });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired token');
        const hashed = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({ where: { id: user.id }, data: { password: hashed, resetPasswordToken: null, resetPasswordExpires: null } });
        return { message: 'Password has been reset' };
    }
    async createSignupRequest(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.BadRequestException('Email already in use');
        const existingReq = await this.prisma.signupRequest.findUnique({ where: { email: dto.email } });
        if (existingReq)
            throw new common_1.BadRequestException('A signup request with this email already exists');
        const req = await this.prisma.signupRequest.create({ data: { name: dto.name, email: dto.email, roleRequested: dto.roleRequested, message: dto.message, password: dto.password || null } });
        try {
            // PROACTIVELY NOTIFY ADMINS
            await this.notificationService.create({
                title: 'Nouvelle demande d\'admin',
                message: `${dto.name} (${dto.email}) souhaite devenir ${dto.roleRequested}.`,
                type: 'SIGNUP_REQUEST',
            });
        }
        catch (e) {
            console.error('Failed to create in-app notification', e);
        }
        const superEmail = process.env.SUPERADMIN_EMAIL || 'espectro.ash@gmail.com';
        try {
            await this.mail.sendSignupNotification(superEmail, req);
        }
        catch (err) {
            console.error('Failed to send signup notification', err);
        }
        try {
            await this.prisma.auditLog.create({ data: { actorId: null, targetUserId: null, action: 'signup.request', meta: { email: dto.email, name: dto.name } } });
        }
        catch (e) {
            console.error('Failed to write audit log', e);
        }
        return { message: 'Signup request submitted' };
    }
    async register(dto) {
        const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
        if (existing)
            throw new common_1.BadRequestException('Email already in use');
        const hashedPassword = await bcrypt.hash(dto.password, 10);
        // Generate unique username
        let usernameBase = dto.name;
        if (!usernameBase && dto.firstName && dto.lastName) {
            usernameBase = `${dto.firstName}${dto.lastName}`.replace(/\s+/g, '').toLowerCase();
        }
        if (!usernameBase) {
            usernameBase = dto.email.split('@')[0];
        }
        // Check for username collision and append random bits if needed
        let finalUsername = usernameBase;
        const existingUsername = await this.prisma.user.findUnique({ where: { username: finalUsername } });
        if (existingUsername) {
            finalUsername = `${usernameBase}${crypto.randomBytes(2).toString('hex')}`;
        }
        const verifyToken = crypto.randomBytes(32).toString('hex');
        const hashedVerifyToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
        const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                username: finalUsername,
                role: 'USER',
                emailVerified: false,
                emailVerifyToken: hashedVerifyToken,
                emailVerifyExpires: verifyExpires,
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
        const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
        const verifyUrl = `${frontendBase}/verify-email?token=${verifyToken}`;
        await this.mail.sendEmailVerification(user.email, user.firstName || user.username, verifyUrl);
        return { message: 'Verification email sent' };
    }
    async verifyEmail(token) {
        if (!token)
            throw new common_1.BadRequestException('token required');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        const user = await this.prisma.user.findFirst({
            where: {
                emailVerifyToken: hashedToken,
                emailVerifyExpires: { gt: new Date() },
            },
        });
        if (!user)
            throw new common_1.BadRequestException('Invalid or expired token');
        const updated = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerifyToken: null,
                emailVerifyExpires: null,
            },
        });
        const payload = { sub: updated.id, username: updated.username, role: updated.role };
        const access_token = this.jwtService.sign(payload);
        return { access_token };
    }
    async logout(refreshToken) {
        try {
            const payload = this.jwtService.verify(refreshToken);
            const userId = payload?.sub;
            if (!userId)
                return;
            await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
        }
        catch (err) {
            // ignore
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        mail_service_1.MailService,
        notification_service_1.NotificationService])
], AuthService);
