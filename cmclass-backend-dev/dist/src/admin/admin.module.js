"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const admin_controller_1 = require("./admin.controller");
const auth_module_1 = require("../auth/auth.module");
const users_controller_1 = require("./users.controller");
const mail_service_1 = require("../mail/mail.service");
const audit_controller_1 = require("./audit.controller");
const signup_requests_controller_1 = require("./signup-requests.controller");
const brand_controller_1 = require("./brand.controller");
const brand_service_1 = require("../brand/brand.service");
const category_controller_1 = require("./category.controller");
const category_service_1 = require("./category.service");
const product_controller_1 = require("./product.controller");
const product_service_1 = require("./product.service");
const hero_controller_1 = require("./hero.controller");
const hero_service_1 = require("../hero/hero.service");
const campaign_controller_1 = require("./campaign.controller");
const campaign_service_1 = require("./campaign.service");
const service_controller_1 = require("./service.controller");
const service_service_1 = require("./service.service");
const prisma_module_1 = require("../prisma/prisma.module");
const about_controller_1 = require("./about.controller");
const dashboard_controller_1 = require("./dashboard.controller");
const orders_controller_1 = require("./orders.controller");
const about_service_1 = require("../about/about.service");
const footer_controller_1 = require("./footer.controller");
const footer_service_1 = require("../footer/footer.service");
const notifications_controller_1 = require("./notifications.controller");
const notification_service_1 = require("../notification/notification.service");
const inbound_emails_controller_1 = require("./inbound-emails.controller");
const inbound_email_service_1 = require("../mail/inbound-email.service");
const legal_controller_1 = require("./legal.controller");
const legal_service_1 = require("../legal/legal.service");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [auth_module_1.AuthModule, prisma_module_1.PrismaModule],
        controllers: [admin_controller_1.AdminController, users_controller_1.UsersController, audit_controller_1.AuditController, signup_requests_controller_1.SignupRequestsController, brand_controller_1.BrandController, category_controller_1.CategoryController, product_controller_1.ProductController, hero_controller_1.HeroController, campaign_controller_1.CampaignController, service_controller_1.ServiceController, about_controller_1.AboutController, dashboard_controller_1.DashboardController, orders_controller_1.OrdersController, footer_controller_1.FooterController, notifications_controller_1.NotificationsController, inbound_emails_controller_1.InboundEmailsController, legal_controller_1.AdminLegalController],
        providers: [mail_service_1.MailService, brand_service_1.BrandService, category_service_1.CategoryService, product_service_1.ProductService, hero_service_1.HeroService, campaign_service_1.CampaignService, service_service_1.ServiceService, about_service_1.AboutService, footer_service_1.FooterService, notification_service_1.NotificationService, inbound_email_service_1.InboundEmailService, legal_service_1.LegalService],
        exports: [mail_service_1.MailService, brand_service_1.BrandService, category_service_1.CategoryService, product_service_1.ProductService, hero_service_1.HeroService, campaign_service_1.CampaignService, service_service_1.ServiceService, about_service_1.AboutService, footer_service_1.FooterService, notification_service_1.NotificationService, inbound_email_service_1.InboundEmailService, legal_service_1.LegalService],
    })
], AdminModule);
