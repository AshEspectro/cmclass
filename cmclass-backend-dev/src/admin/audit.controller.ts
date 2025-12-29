import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/audit')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AuditController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Roles('SUPER_ADMIN')
  async list(@Query('page') pageRaw?: string, @Query('pageSize') pageSizeRaw?: string) {
    const page = Math.max(1, Number(pageRaw) || 1);
    const pageSize = Math.min(100, Number(pageSizeRaw) || 50);
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
      this.prisma.auditLog.count(),
    ]);
    return { data: items, meta: { total, page, pageSize } };
  }

  @Post()
  @Roles('ADMIN')
  async create(@Body() body: { actorId?: number; targetUserId?: number; action: string; meta?: any }) {
    const item = await this.prisma.auditLog.create({ data: { actorId: body.actorId, targetUserId: body.targetUserId, action: body.action, meta: body.meta } });
    return item;
  }
}
