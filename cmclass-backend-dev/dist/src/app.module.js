"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const admin_module_1 = require("./admin/admin.module");
const prisma_module_1 = require("./prisma/prisma.module");
const users_module_1 = require("./users/users.module");
const cart_module_1 = require("./cart/cart.module");
const wishlist_module_1 = require("./wishlist/wishlist.module");
const brand_controller_1 = require("./public/brand.controller");
const category_controller_1 = require("./public/category.controller");
const hero_controller_1 = require("./public/hero.controller");
const product_controller_1 = require("./public/product.controller");
const campaigns_controller_1 = require("./public/campaigns.controller");
const services_controller_1 = require("./public/services.controller");
const about_controller_1 = require("./public/about.controller");
const contact_controller_1 = require("./public/contact.controller");
const orders_module_1 = require("./orders/orders.module");
const footer_controller_1 = require("./public/footer.controller");
const footer_service_1 = require("./footer/footer.service");
const mail_receiver_service_1 = require("./mail/mail-receiver.service");
const legal_module_1 = require("./legal/legal.module");
const legal_controller_1 = require("./public/legal.controller");
const maxicash_module_1 = require("./maxicash/maxicash.module");
const notification_module_1 = require("./notification/notification.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule, admin_module_1.AdminModule, users_module_1.UsersModule, cart_module_1.CartModule, wishlist_module_1.WishlistModule, orders_module_1.OrdersModule, legal_module_1.LegalModule, maxicash_module_1.MaxicashModule, notification_module_1.NotificationModule],
        controllers: [brand_controller_1.PublicBrandController, category_controller_1.PublicCategoryController, hero_controller_1.PublicHeroController, product_controller_1.PublicProductController, campaigns_controller_1.CampaignsController, services_controller_1.PublicServicesController, about_controller_1.PublicAboutController, contact_controller_1.PublicContactController, footer_controller_1.PublicFooterController, legal_controller_1.PublicLegalController],
        providers: [footer_service_1.FooterService, mail_receiver_service_1.MailReceiverService],
    })
], AppModule);
