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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_decorator_1 = require("./roles.decorator");
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        // If no roles are required, allow access
        if (!requiredRoles || requiredRoles.length === 0) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const { user } = request;
        if (!user) {
            throw new common_1.ForbiddenException('User not authenticated');
        }
        // Role hierarchy: USER < SUPPORT < MODERATOR < ADMIN < SUPER_ADMIN
        const rank = {
            USER: 0,
            SUPPORT: 1,
            MODERATOR: 2,
            ADMIN: 3,
            SUPER_ADMIN: 4,
        };
        const userRank = rank[user.role] ?? -1;
        if (userRank === -1) {
            throw new common_1.ForbiddenException(`Unknown role: ${user.role}`);
        }
        const requiredRanks = requiredRoles.map((r) => rank[r] ?? 0);
        const minRequired = Math.min(...requiredRanks);
        if (userRank >= minRequired) {
            return true;
        }
        throw new common_1.ForbiddenException(`User role ${user.role} (rank ${userRank}) does not meet minimum required rank ${minRequired}`);
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
