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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const forgot_password_dto_1 = require("./dto/forgot-password.dto");
const reset_password_dto_1 = require("./dto/reset-password.dto");
const oauth_dto_1 = require("./dto/oauth.dto");
const signup_request_dto_1 = require("./dto/signup-request.dto");
const register_dto_1 = require("./dto/register.dto");
const prisma_service_1 = require("../prisma/prisma.service");
const jwt_auth_guard_1 = require("./jwt-auth.guard");
let AuthController = class AuthController {
    constructor(authService, prisma) {
        this.authService = authService;
        this.prisma = prisma;
    }
    getCookieOptions() {
        const oneMonth = 30 * 24 * 60 * 60 * 1000;
        return {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: oneMonth,
        };
    }
    async login(dto, res) {
        const result = await this.authService.login(dto.email, dto.password, !!dto.remember);
        if (result.refresh_token) {
            const refresh = result.refresh_token;
            res.cookie('refresh_token', refresh, this.getCookieOptions());
            delete result.refresh_token;
        }
        return result;
    }
    async adminLogin(dto, res) {
        const result = await this.authService.adminLogin(dto.email, dto.password, !!dto.remember);
        if (result.refresh_token) {
            const refresh = result.refresh_token;
            res.cookie('refresh_token', refresh, this.getCookieOptions());
            delete result.refresh_token;
        }
        return result;
    }
    async register(dto) {
        return this.authService.register(dto);
    }
    async oauth(dto, res) {
        const result = await this.authService.oauthLogin(dto.provider, dto.token, !!dto.remember);
        if (result.refresh_token) {
            const refresh = result.refresh_token;
            res.cookie('refresh_token', refresh, this.getCookieOptions());
            delete result.refresh_token;
        }
        return result;
    }
    async refresh(req, body) {
        const token = req.cookies?.refresh_token || body?.refresh_token;
        if (!token)
            throw new common_1.BadRequestException('refresh_token required');
        return this.authService.refresh(token);
    }
    async logout(req, res) {
        const token = req.cookies?.refresh_token;
        if (token) {
            await this.authService.logout(token);
            res.clearCookie('refresh_token', this.getCookieOptions());
        }
        return { message: 'Logged out' };
    }
    async forgot(dto) {
        return this.authService.generatePasswordResetToken(dto.email);
    }
    async reset(dto) {
        return this.authService.resetPassword(dto.token, dto.newPassword);
    }
    async signupRequest(dto) {
        return this.authService.createSignupRequest(dto);
    }
    async signupStatus(email) {
        if (!email)
            throw new common_1.BadRequestException('email required');
        const sr = await this.prisma.signupRequest.findUnique({ where: { email } });
        if (!sr)
            return { status: 'NOT_FOUND' };
        return { status: sr.status };
    }
    async verifyEmail(token) {
        if (!token)
            throw new common_1.BadRequestException('token required');
        return this.authService.verifyEmail(token);
    }
    async me(req) {
        const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const { password, refreshToken, ...rest } = user;
        return { user: rest };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('admin/login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "adminLogin", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('oauth'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [oauth_dto_1.OAuthDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "oauth", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('forgot'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [forgot_password_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgot", null);
__decorate([
    (0, common_1.Post)('reset'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_password_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "reset", null);
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [signup_request_dto_1.SignupRequestDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signupRequest", null);
__decorate([
    (0, common_1.Get)('signup-status'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signupStatus", null);
__decorate([
    (0, common_1.Get)('verify'),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService, prisma_service_1.PrismaService])
], AuthController);
