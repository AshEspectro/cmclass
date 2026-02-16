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
exports.CampaignController = void 0;
const common_1 = require("@nestjs/common");
const campaign_service_1 = require("./campaign.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const notification_service_1 = require("../notification/notification.service");
let CampaignController = class CampaignController {
    constructor(campaignService, notificationService) {
        this.campaignService = campaignService;
        this.notificationService = notificationService;
    }
    async list() {
        const campaigns = await this.campaignService.list();
        return { data: campaigns };
    }
    async get(id) {
        const campaign = await this.campaignService.get(id);
        return { data: campaign };
    }
    async create(body, req) {
        const campaign = await this.campaignService.create(body);
        await this.notificationService.create({
            title: 'Nouvelle campagne créée',
            message: `La campagne "${campaign.title}" a été créée par ${req.user.username}.`,
            type: 'CAMPAIGN_CREATE',
        });
        return { data: campaign };
    }
    async update(id, body, req) {
        const campaign = await this.campaignService.update(id, body);
        await this.notificationService.create({
            title: 'Campagne mise à jour',
            message: `La campagne "${campaign.title}" (#${id}) a été mise à jour par ${req.user.username}.`,
            type: 'CAMPAIGN_UPDATE',
        });
        return { data: campaign };
    }
    async delete(id, req) {
        await this.campaignService.delete(id);
        await this.notificationService.create({
            title: 'Campagne supprimée',
            message: `Une campagne (#${id}) a été supprimée par ${req.user.username}.`,
            type: 'CAMPAIGN_DELETE',
        });
        return { message: 'Campaign deleted' };
    }
};
exports.CampaignController = CampaignController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "get", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CampaignController.prototype, "delete", null);
exports.CampaignController = CampaignController = __decorate([
    (0, common_1.Controller)('admin/campaigns'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('ADMIN', 'SUPER_ADMIN'),
    __metadata("design:paramtypes", [campaign_service_1.CampaignService,
        notification_service_1.NotificationService])
], CampaignController);
