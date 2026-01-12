import { Controller, Get, Post, Param, Body, Request, ForbiddenException, BadRequestException, UseGuards, Delete } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Controller('admin/signup-requests')
@Roles('ADMIN')
export class SignupRequestsController {
  constructor(private prisma: PrismaService, private mail: MailService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async list() {
    // return only pending requests so processed ones are not shown in the admin UI
    const data = await this.prisma.signupRequest.findMany({ where: { status: 'PENDING' }, orderBy: { createdAt: 'desc' } });
    return { data };
  }

  @Get('count')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async count() {
    const count = await this.prisma.signupRequest.count({ where: { status: 'PENDING' } });
    return { count };
  }

  @Post(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async approve(@Request() req: any, @Param('id') id: string, @Body() body: { role?: string }) {
    const parsed = Number(id);
    if (Number.isNaN(parsed)) throw new BadRequestException('Invalid id');

    const sr = await this.prisma.signupRequest.findUnique({ where: { id: parsed } });
    if (!sr) throw new BadRequestException('Signup request not found');
    if (sr.status !== 'PENDING') throw new BadRequestException('Request already processed');

    const emailExists = await this.prisma.user.findUnique({ where: { email: sr.email } });
    if (emailExists) throw new BadRequestException('Email already in use');

    // Use supplied password if the user provided one, otherwise generate a random password
    const rawPassword = sr.password && sr.password.length > 0 ? sr.password : randomBytes(8).toString('hex');
    const hashed = await bcrypt.hash(rawPassword, 10);

    const roleToAssign = body?.role ?? 'USER'; // Ignore the roleRequested, use admin selection

    const username = sr.name.replace(/\s+/g, '').toLowerCase();
    const user = await this.prisma.user.create({ data: { email: sr.email, username, password: hashed, role: roleToAssign as any } });

    // Mark request processed and clear sensitive password field
    await this.prisma.signupRequest.update({ where: { id: parsed }, data: { status: 'APPROVED', processedAt: new Date(), processedById: req.user?.sub ?? null, password: null } });

    try {
      await this.mail.sendApprovalEmail(user.email, user.username, rawPassword, roleToAssign);
    } catch (err) {
      // log and continue
      console.error('Failed to send approval email', err);
    }

    try {
      await this.prisma.auditLog.create({ data: { actorId: req.user?.sub ?? null, targetUserId: user.id, action: 'signup.approve', meta: { signupRequestId: sr.id } } });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }

    return { user: { id: user.id, email: user.email, username: user.username } };
  }

  @Post(':id/deny')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async deny(@Request() req: any, @Param('id') id: string, @Body() body: { reason?: string }) {
    const parsed = Number(id);
    if (Number.isNaN(parsed)) throw new BadRequestException('Invalid id');

    const sr = await this.prisma.signupRequest.findUnique({ where: { id: parsed } });
    if (!sr) throw new BadRequestException('Signup request not found');
    if (sr.status !== 'PENDING') throw new BadRequestException('Request already processed');

    await this.prisma.signupRequest.update({ where: { id: parsed }, data: { status: 'DENIED', processedAt: new Date(), processedById: req.user?.sub ?? null } });

    try {
      await this.mail.sendDenialEmail(sr.email, sr.name);
    } catch (err) {
      console.error('Failed to send denial email', err);
    }

    try {
      await this.prisma.auditLog.create({ data: { actorId: req.user?.sub ?? null, action: 'signup.deny', meta: { signupRequestId: sr.id, reason: body?.reason } } });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }

    return { success: true };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    const parsed = Number(id);
    if (Number.isNaN(parsed)) throw new BadRequestException('Invalid id');
    await this.prisma.signupRequest.delete({ where: { id: parsed } });
    return { success: true };
  }
}