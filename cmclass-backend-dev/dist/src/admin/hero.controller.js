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
exports.HeroController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const hero_service_1 = require("../hero/hero.service");
const update_hero_dto_1 = require("./dto/update-hero.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const fs_1 = require("fs");
function filename(req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const name = `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    cb(null, name);
}
let HeroController = class HeroController {
    constructor(heroService) {
        this.heroService = heroService;
    }
    async getHero() {
        const hero = await this.heroService.get();
        return { data: hero };
    }
    async updateHero(body) {
        const hero = await this.heroService.upsert(body);
        return { data: hero };
    }
    async uploadImage(file, req) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const url = `${req.protocol}://${req.get('host')}/uploads/hero/${file.filename}`;
        return { url };
    }
    async uploadVideo(file, req) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const url = `${req.protocol}://${req.get('host')}/uploads/hero/${file.filename}`;
        return { url };
    }
};
exports.HeroController = HeroController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HeroController.prototype, "getHero", null);
__decorate([
    (0, common_1.Patch)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_hero_dto_1.UpdateHeroDto]),
    __metadata("design:returntype", Promise)
], HeroController.prototype, "updateHero", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = (0, path_1.join)(process.cwd(), 'public', 'uploads', 'hero');
                if (!(0, fs_1.existsSync)(dest))
                    (0, fs_1.mkdirSync)(dest, { recursive: true });
                cb(null, dest);
            },
            filename: filename,
        }),
        limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/png', 'image/jpeg', 'image/webp'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Only PNG, JPG, and WebP files are allowed'), false);
            }
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HeroController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Post)('upload-video'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = (0, path_1.join)(process.cwd(), 'public', 'uploads', 'hero');
                if (!(0, fs_1.existsSync)(dest))
                    (0, fs_1.mkdirSync)(dest, { recursive: true });
                cb(null, dest);
            },
            filename: filename,
        }),
        limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for videos
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Only MP4, WebM, and OGG video files are allowed'), false);
            }
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], HeroController.prototype, "uploadVideo", null);
exports.HeroController = HeroController = __decorate([
    (0, common_1.Controller)('admin/hero'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __metadata("design:paramtypes", [hero_service_1.HeroService])
], HeroController);
