import { Body, Controller, Post, BadRequestException, Req, Res, Get, Query, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OAuthDto } from './dto/oauth.dto';
import { SignupRequestDto } from './dto/signup-request.dto';
import { RegisterDto } from './dto/register.dto';
import { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private prisma: PrismaService) { }

  private getCookieOptions() {
    const oneMonth = 30 * 24 * 60 * 60 * 1000;
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as 'lax',
      maxAge: oneMonth,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.email, dto.password, !!dto.remember);
    if ((result as any).refresh_token) {
      const refresh = (result as any).refresh_token;
      res.cookie('refresh_token', refresh, this.getCookieOptions());
      delete (result as any).refresh_token;
    }
    return result;
  }

  @Post('admin/login')
  async adminLogin(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.adminLogin(dto.email, dto.password, !!dto.remember);
    if ((result as any).refresh_token) {
      const refresh = (result as any).refresh_token;
      res.cookie('refresh_token', refresh, this.getCookieOptions());
      delete (result as any).refresh_token;
    }
    return result;
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('oauth')
  async oauth(@Body() dto: OAuthDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.oauthLogin(dto.provider, dto.token, !!dto.remember);
    if ((result as any).refresh_token) {
      const refresh = (result as any).refresh_token;
      res.cookie('refresh_token', refresh, this.getCookieOptions());
      delete (result as any).refresh_token;
    }
    return result;
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Body() body: { refresh_token?: string }) {
    const token = (req as any).cookies?.refresh_token || body?.refresh_token;
    if (!token) throw new BadRequestException('refresh_token required');
    return this.authService.refresh(token);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token = (req as any).cookies?.refresh_token;
    if (token) {
      await this.authService.logout(token);
      res.clearCookie('refresh_token', this.getCookieOptions());
    }
    return { message: 'Logged out' };
  }

  @Post('forgot')
  async forgot(@Body() dto: ForgotPasswordDto) {
    return this.authService.generatePasswordResetToken(dto.email);
  }

  @Post('reset')
  async reset(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  @Post('signup')
  async signupRequest(@Body() dto: SignupRequestDto) {
    return this.authService.createSignupRequest(dto);
  }

  @Get('signup-status')
  async signupStatus(@Query('email') email: string) {
    if (!email) throw new BadRequestException('email required');
    const sr = await this.prisma.signupRequest.findUnique({ where: { email } });
    if (!sr) return { status: 'NOT_FOUND' };
    return { status: sr.status };
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string) {
    if (!token) throw new BadRequestException('token required');
    return this.authService.verifyEmail(token);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@Req() req) {
    const user = await this.prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user) throw new BadRequestException('User not found');
    const { password, refreshToken, ...rest } = user as any;
    return { user: rest };
  }
}
