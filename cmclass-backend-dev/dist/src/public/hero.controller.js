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
exports.PublicHeroController = void 0;
const common_1 = require("@nestjs/common");
const hero_service_1 = require("../hero/hero.service");
let PublicHeroController = class PublicHeroController {
    constructor(heroService) {
        this.heroService = heroService;
    }
    async getPublic() {
        const hero = await this.heroService.get();
        const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;
        return {
            id: hero.id,
            mainText: hero.mainText,
            subtext: hero.subtext,
            backgroundImageUrl: hero.backgroundImageUrl && hero.backgroundImageUrl.startsWith('/') ? `${base}${hero.backgroundImageUrl}` : hero.backgroundImageUrl,
            backgroundVideoUrl: hero.backgroundVideoUrl && hero.backgroundVideoUrl.startsWith('/') ? `${base}${hero.backgroundVideoUrl}` : hero.backgroundVideoUrl,
            mediaType: hero.mediaType,
            ctaButtonText: hero.ctaButtonText,
            ctaButtonUrl: hero.ctaButtonUrl,
            isActive: hero.isActive,
            createdAt: hero.createdAt,
            updatedAt: hero.updatedAt,
        };
    }
};
exports.PublicHeroController = PublicHeroController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PublicHeroController.prototype, "getPublic", null);
exports.PublicHeroController = PublicHeroController = __decorate([
    (0, common_1.Controller)('hero'),
    __metadata("design:paramtypes", [hero_service_1.HeroService])
], PublicHeroController);
