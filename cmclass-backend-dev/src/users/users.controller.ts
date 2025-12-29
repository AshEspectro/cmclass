import { Controller, Patch, Body, UseGuards, BadRequestException, Request, UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

type ChangePasswordDto = { currentPassword: string; newPassword: string };

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private prisma: PrismaService) {}

  @Patch('me/password')
  async changeMyPassword(@Request() req: any, @Body() dto: ChangePasswordDto) {
    const userId = req.user?.sub;
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
