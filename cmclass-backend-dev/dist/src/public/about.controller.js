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
exports.PublicAboutController = void 0;
const common_1 = require("@nestjs/common");
const about_service_1 = require("../about/about.service");
let PublicAboutController = class PublicAboutController {
    constructor(aboutService) {
        this.aboutService = aboutService;
    }
    async getPublic() {
        const about = await this.aboutService.get();
        const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        const heroImageUrl = about.heroImageUrl && about.heroImageUrl.startsWith('/')
            ? `${base}${about.heroImageUrl}`
            : about.heroImageUrl;
        const craftImageUrl = about.craftImageUrl && about.craftImageUrl.startsWith('/')
            ? `${base}${about.craftImageUrl}`
            : about.craftImageUrl;
        const values = Array.isArray(about.values) ? about.values : [];
        return {
            id: about.id,
            heroTitle: about.heroTitle,
            heroImageUrl,
            visionTitle: about.visionTitle,
            visionParagraphs: about.visionParagraphs || [],
            craftTitle: about.craftTitle,
            craftParagraphs: about.craftParagraphs || [],
            craftImageUrl,
            valuesTitle: about.valuesTitle,
            values,
            ctaTitle: about.ctaTitle,
            ctaDescription: about.ctaDescription || null,
            ctaButtonText: about.ctaButtonText,
            ctaButtonUrl: about.ctaButtonUrl,
            isActive: about.isActive,
            createdAt: about.createdAt,
            updatedAt: about.updatedAt,
        };
    }
};
exports.PublicAboutController = PublicAboutController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicAboutController.prototype, "getPublic", null);
exports.PublicAboutController = PublicAboutController = __decorate([
    (0, common_1.Controller)('about'),
    __metadata("design:paramtypes", [about_service_1.AboutService])
], PublicAboutController);
