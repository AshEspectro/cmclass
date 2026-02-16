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
exports.BrandController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const brand_service_1 = require("../brand/brand.service");
const update_brand_dto_1 = require("./dto/update-brand.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const fs_1 = require("fs");
const notification_service_1 = require("../notification/notification.service");
function filename(req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    cb(null, name);
}
let BrandController = class BrandController {
    constructor(brandService, notificationService) {
        this.brandService = brandService;
        this.notificationService = notificationService;
    }
    async getBrand() {
        return { data: await this.brandService.get() };
    }
    async update(body, req) {
        const brand = await this.brandService.upsert(body);
        await this.notificationService.create({
            title: 'Configuration de marque mise à jour',
            message: `L'administrateur ${req.user.username} a mis à jour les paramètres de la marque.`,
            type: 'BRAND_UPDATE',
        });
        return { data: brand };
    }
    async uploadFile(file, req) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const url = `${req.protocol}://${req.get('host')}/uploads/brand/${file.filename}`;
        return { url };
    }
};
exports.BrandController = BrandController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "getBrand", null);
__decorate([
    (0, common_1.Patch)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_brand_dto_1.UpdateBrandDto, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = (0, path_1.join)(process.cwd(), 'public', 'uploads', 'brand');
                if (!(0, fs_1.existsSync)(dest))
                    (0, fs_1.mkdirSync)(dest, { recursive: true });
                cb(null, dest);
            },
            filename: filename,
        }),
        limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BrandController.prototype, "uploadFile", null);
exports.BrandController = BrandController = __decorate([
    (0, common_1.Controller)('admin/brand'),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __metadata("design:paramtypes", [brand_service_1.BrandService,
        notification_service_1.NotificationService])
], BrandController);
