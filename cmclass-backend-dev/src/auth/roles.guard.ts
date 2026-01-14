import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
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

    // If no roles are required, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const { user } = request;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Role hierarchy: USER < SUPPORT < MODERATOR < ADMIN < SUPER_ADMIN
    const rank: Record<string, number> = {
      USER: 0,
      SUPPORT: 1,
      MODERATOR: 2,
      ADMIN: 3,
      SUPER_ADMIN: 4,
    };

    const userRank = rank[user.role] ?? -1;
    if (userRank === -1) {
      throw new ForbiddenException(`Unknown role: ${user.role}`);
    }

    const requiredRanks = requiredRoles.map((r) => rank[r] ?? 0);
    const minRequired = Math.min(...requiredRanks);

    if (userRank >= minRequired) {
      return true;
    }

    throw new ForbiddenException(`User role ${user.role} (rank ${userRank}) does not meet minimum required rank ${minRequired}`);
  }
}
