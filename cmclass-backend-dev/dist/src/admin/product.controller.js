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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
const product_service_1 = require("./product.service");
const create_product_dto_1 = require("./dto/create-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const notification_service_1 = require("../notification/notification.service");
function filename(req, file, cb) {
    const ext = file.originalname.split('.').pop();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    cb(null, name);
}
let ProductController = class ProductController {
    constructor(svc, notificationService) {
        this.svc = svc;
        this.notificationService = notificationService;
    }
    async list(page = '1', pageSize = '20', search = '') {
        const res = await this.svc.list({ page: Number(page), pageSize: Number(pageSize), search });
        return res;
    }
    async get(id) {
        return { data: await this.svc.get(Number(id)) };
    }
    async create(body, req) {
        const c = await this.svc.create(body);
        await this.notificationService.create({
            title: 'Nouveau produit ajouté',
            message: `Le produit "${c.name}" a été ajouté par ${req.user.username}.`,
            type: 'PRODUCT_CREATE',
        });
        return { data: c };
    }
    async update(id, body, req) {
        const c = await this.svc.update(Number(id), body);
        await this.notificationService.create({
            title: 'Produit mis à jour',
            message: `Le produit "${c.name}" (#${id}) a été mis à jour par ${req.user.username}.`,
            type: 'PRODUCT_UPDATE',
        });
        return { data: c };
    }
    async remove(id, req) {
        await this.svc.delete(Number(id));
        await this.notificationService.create({
            title: 'Produit supprimé',
            message: `Le produit #${id} a été supprimé par ${req.user.username}.`,
            type: 'PRODUCT_DELETE',
        });
        return { success: true };
    }
    async upload(file, req) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        const url = `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`;
        return { url };
    }
};
exports.ProductController = ProductController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_product_dto_1.CreateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: (req, file, cb) => {
                const dest = (0, path_1.join)(process.cwd(), 'public', 'uploads', 'products');
                if (!(0, fs_1.existsSync)(dest))
                    (0, fs_1.mkdirSync)(dest, { recursive: true });
                cb(null, dest);
            },
            filename: filename,
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "upload", null);
exports.ProductController = ProductController = __decorate([
    (0, common_1.Controller)('admin/products'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        notification_service_1.NotificationService])
], ProductController);
