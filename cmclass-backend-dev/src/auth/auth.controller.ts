import { Body, Controller, Post, BadRequestException, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { OAuthDto } from './dto/oauth.dto';
import { SignupRequestDto } from './dto/signup-request.dto';
import { Request, Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
      // do not expose refresh token in response body
      delete (result as any).refresh_token;
    }
    return result;
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

  // Public signup request — creates a pending request for admin approval
  @Post('signup')
  async signupRequest(@Body() dto: SignupRequestDto) {
    return this.authService.createSignupRequest(dto);
  }
}
