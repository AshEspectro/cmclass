import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    if (!user) return false;
    // Role hierarchy: USER < SUPPORT < MODERATOR < ADMIN < SUPER_ADMIN
    const rank: Record<string, number> = {
      USER: 0,
      SUPPORT: 1,
      MODERATOR: 2,
      ADMIN: 3,
      SUPER_ADMIN: 4
    };

    const userRank = rank[user.role] ?? 0;
    const requiredRanks = requiredRoles.map((r) => rank[r] ?? 0);
    const minRequired = Math.min(...requiredRanks);
    return userRank >= minRequired;
  }
}
