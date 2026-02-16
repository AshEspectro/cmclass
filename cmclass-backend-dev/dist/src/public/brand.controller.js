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
exports.PublicBrandController = void 0;
const common_1 = require("@nestjs/common");
const brand_service_1 = require("../brand/brand.service");
let PublicBrandController = class PublicBrandController {
    constructor(brandService) {
        this.brandService = brandService;
    }
    async getPublic() {
        const brand = await this.brandService.get();
        const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        const logo = brand.logoUrl && brand.logoUrl.startsWith('/') ? `${base}${brand.logoUrl}` : brand.logoUrl;
        const logoLight = brand.logoLightUrl && brand.logoLightUrl.startsWith('/') ? `${base}${brand.logoLightUrl}` : brand.logoLightUrl;
        const logoDark = brand.logoDarkUrl && brand.logoDarkUrl.startsWith('/') ? `${base}${brand.logoDarkUrl}` : brand.logoDarkUrl;
        const favicon = brand.faviconUrl && brand.faviconUrl.startsWith('/') ? `${base}${brand.faviconUrl}` : brand.faviconUrl;
        return {
            name: brand.name,
            slogan: brand.slogan || null,
            description: brand.description || null,
            contactEmail: brand.contactEmail || null,
            instagramUrl: brand.instagramUrl || null,
            facebookUrl: brand.facebookUrl || null,
            twitterUrl: brand.twitterUrl || null,
            pinterestUrl: brand.pinterestUrl || null,
            footerText: brand.footerText || null,
            logoUrl: logo,
            logoLightUrl: logoLight || null,
            logoDarkUrl: logoDark || null,
            faviconUrl: favicon,
            servicesHeaderTitle: brand.servicesHeaderTitle || null,
            servicesHeaderDescription: brand.servicesHeaderDescription || null,
        };
    }
};
exports.PublicBrandController = PublicBrandController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicBrandController.prototype, "getPublic", null);
exports.PublicBrandController = PublicBrandController = __decorate([
    (0, common_1.Controller)('brand'),
    __metadata("design:paramtypes", [brand_service_1.BrandService])
], PublicBrandController);
