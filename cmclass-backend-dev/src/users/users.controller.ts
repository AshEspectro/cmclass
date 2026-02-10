import { Controller, Patch, Body, UseGuards, BadRequestException, Request, UnauthorizedException, Get } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcrypt';

type ChangePasswordDto = { currentPassword: string; newPassword: string };

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private prisma: PrismaService) { }

  @Get('me')
  async getMe(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    const { password, refreshToken, resetPasswordToken, resetPasswordExpires, ...rest } = user as any;
    return rest;
  }

  @Patch('me')
  async updateMe(@Request() req: any, @Body() dto: UpdateProfileDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();

    const updateData: any = { ...dto };
    if (dto.dateOfBirth) {
      updateData.dateOfBirth = new Date(dto.dateOfBirth);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    const { password, refreshToken, resetPasswordToken, resetPasswordExpires, ...rest } = user as any;
    return rest;
  }

  @Patch('me/password')
  async changeMyPassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user?.id;
    if (!userId) throw new UnauthorizedException();
    if (!dto?.currentPassword || !dto?.newPassword) throw new BadRequestException('currentPassword and newPassword required');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    const ok = await bcrypt.compare(dto.currentPassword, user.password);
    if (!ok) throw new BadRequestException('Current password is incorrect');

    const hashed = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { password: hashed } });
    return { success: true };
  }
}
