import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  UseGuards,
  BadRequestException,
  NotFoundException,
  Query,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from '../mail/mail.service';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private prisma: PrismaService, private mail: MailService) {}

  @Get()
  async list(
    @Query('page') pageRaw?: string,
    @Query('pageSize') pageSizeRaw?: string,
    @Query('search') search?: string,
  ) {
    const page = Math.max(1, Number(pageRaw) || 1);
    const pageSize = Math.min(100, Number(pageSizeRaw) || 20);
    const skip = (page - 1) * pageSize;
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: pageSize }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((u) => {
        const { password, ...rest } = u as any;
        return rest;
      }),
      meta: { total, page, pageSize },
    };
  }

  @Post()
  async create(@Request() req: any, @Body() dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already in use');

    const rawPassword = randomBytes(8).toString('hex');
    const hashed = await bcrypt.hash(rawPassword, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        username: dto.username,
        password: hashed,
        role: dto.role ?? 'USER',
      },
    });

    const { password, ...rest } = user as any;
    // send invite email instead of returning temp password
    try {
      const sendRes = await this.mail.sendInviteEmail(user.email, user.username, rawPassword);
      if (process.env.NODE_ENV !== 'production') {
        // log and include send result for debugging in dev
        console.log('[DEV] Created user raw password:', rawPassword);
        console.log('[DEV] Mail send result:', sendRes);
      }
    } catch (err) {
      // don't block creation if email fails; log handled in MailService
    }

    const resp: any = { user: rest };
    if (process.env.NODE_ENV !== 'production') {
      resp.password = rawPassword; // convenience for dev testing
    }

    // Audit log
    try {
      await this.prisma.auditLog.create({ data: { actorId: req.user?.sub ?? null, targetUserId: user.id, action: 'user.create', meta: { email: user.email, role: user.role } } });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }
    return resp;
  }

  @Patch(':id')
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateUserDto) {
    const parsed = Number(id);
    if (Number.isNaN(parsed)) throw new BadRequestException('Invalid id');

    const existing = await this.prisma.user.findUnique({ where: { id: parsed } });
    if (!existing) throw new NotFoundException('User not found');

    // If updating email, ensure uniqueness
    if (dto.email && dto.email !== existing.email) {
      const byEmail = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (byEmail) throw new BadRequestException('Email already in use');
    }

    // Role changes involving SUPER_ADMIN must be performed by SUPER_ADMIN
    if (dto.role === 'SUPER_ADMIN' || existing.role === 'SUPER_ADMIN') {
      const requesterRole = req.user?.role;
      if (requesterRole !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Only SUPER_ADMIN can modify SUPER_ADMIN accounts or promote to SUPER_ADMIN');
      }
    }

    const user = await this.prisma.user.update({ where: { id: parsed }, data: dto });
    const { password, ...rest } = user as any;

    // Audit
    try {
      await this.prisma.auditLog.create({ data: { actorId: req.user?.sub ?? null, targetUserId: user.id, action: 'user.update', meta: dto as any } });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }

    return rest;
  }

  @Post(':id/reset-password')
  async resetPassword(@Request() req: any, @Param('id') id: string, @Body() body: { password?: string }) {
    const parsed = Number(id);
    if (Number.isNaN(parsed)) throw new BadRequestException('Invalid id');

    const user = await this.prisma.user.findUnique({ where: { id: parsed } });
    if (!user) throw new NotFoundException('User not found');

    const rawPassword = body?.password ?? randomBytes(8).toString('hex');
    const hashed = await bcrypt.hash(rawPassword, 10);

    const updated = await this.prisma.user.update({ where: { id: parsed }, data: { password: hashed } });

    try {
      await this.mail.sendInviteEmail(updated.email, updated.username, rawPassword);
    } catch (err) {
      // MailService logs errors; do not fail the request because of email problems
    }

    const resp: any = { success: true };
    if (process.env.NODE_ENV !== 'production') resp.password = rawPassword;

    // Audit
    try {
      await this.prisma.auditLog.create({ data: { actorId: req.user?.sub ?? null, targetUserId: updated.id, action: 'user.reset_password', meta: { autogenerated: !body?.password } } });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }

    return resp;
  }

  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    const parsed = Number(id);
    if (Number.isNaN(parsed)) throw new BadRequestException('Invalid id');

    try {
      const target = await this.prisma.user.findUnique({ where: { id: parsed } });
      if (!target) throw new NotFoundException('User not found');
      if (target.role === 'SUPER_ADMIN' && req.user?.role !== 'SUPER_ADMIN') {
        throw new ForbiddenException('Only SUPER_ADMIN can delete SUPER_ADMIN accounts');
      }
      await this.prisma.user.delete({ where: { id: parsed } });
      try {
        await this.prisma.auditLog.create({ data: { actorId: req.user?.sub ?? null, targetUserId: parsed, action: 'user.delete', meta: {} } });
      } catch (e) {
        console.error('Failed to write audit log', e);
      }
      return { success: true };
    } catch (err: any) {
      // Prisma P2025: Record to delete does not exist
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw err;
    }
  }
}
