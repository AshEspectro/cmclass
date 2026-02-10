import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService, private mail: MailService) { }

  private getGoogleClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID;
    return new OAuth2Client(clientId);
  }

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    // do not return password
    const { password: _p, ...rest } = user as any;
    return rest;
  }

  async login(email: string, password: string, remember = false) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.emailVerified) throw new UnauthorizedException('Email not verified');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, username: user.username, role: user.role };
    const access_token = this.jwtService.sign(payload);

    if (!remember) return { access_token };

    // generate refresh token (long lived)
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '30d' });
    // store hashed refresh token in DB
    const hashedRefresh = await bcrypt.hash(refresh_token, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });

    return { access_token, refresh_token };
  }

  async adminLogin(email: string, password: string, remember = false) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Enforce admin roles
    const allowedRoles = ['ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT'];
    if (!allowedRoles.includes(user.role)) {
      throw new UnauthorizedException('Access denied. Administrator privileges required.');
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, username: user.username, role: user.role };
    const access_token = this.jwtService.sign(payload);

    if (!remember) return { access_token };

    const refresh_token = this.jwtService.sign(payload, { expiresIn: '30d' });
    const hashedRefresh = await bcrypt.hash(refresh_token, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });

    return { access_token, refresh_token };
  }

  async refresh(refreshToken: string) {
    try {
      const payload: any = this.jwtService.verify(refreshToken);
      const userId = payload?.sub;
      if (!userId) throw new UnauthorizedException('Invalid refresh token');
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.refreshToken) throw new UnauthorizedException('No refresh token stored');
      const ok = await bcrypt.compare(refreshToken, user.refreshToken);
      if (!ok) throw new UnauthorizedException('Invalid refresh token');

      const newAccess = this.jwtService.sign({ sub: user.id, username: user.username, role: user.role });
      return { access_token: newAccess };
    } catch (err) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async oauthLogin(provider: string, token: string, remember = false) {
    if (provider !== 'google') throw new BadRequestException('Unsupported provider');

    const client = this.getGoogleClient();
    let payload: any;
    try {
      const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
      payload = ticket.getPayload();
    } catch (err) {
      throw new UnauthorizedException('Invalid Google token');
    }

    const email = payload?.email;
    if (!email) throw new UnauthorizedException('Google token did not contain email');

    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      const usernameBase = (payload?.name || email.split('@')[0]).replace(/\s+/g, '').toLowerCase();
      const randomSuffix = crypto.randomBytes(3).toString('hex');
      const username = `${usernameBase}${randomSuffix}`;
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = await this.prisma.user.create({ data: { username, email, password: hashed, emailVerified: true } });
    } else if (!user.emailVerified) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true, emailVerifyToken: null, emailVerifyExpires: null },
      });
    }

    const access_token = this.jwtService.sign({ sub: user.id, username: user.username, role: user.role });

    if (!remember) return { access_token };

    const refresh_token = this.jwtService.sign({ sub: user.id, username: user.username, role: user.role }, { expiresIn: '30d' });
    const hashedRefresh = await bcrypt.hash(refresh_token, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { refreshToken: hashedRefresh } });

    return { access_token, refresh_token };
  }

  async generatePasswordResetToken(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new NotFoundException('User not found');

    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await this.prisma.user.update({ where: { id: user.id }, data: { resetPasswordToken: hashedToken, resetPasswordExpires: expires } });

    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    console.log('Password reset link:', resetUrl);

    return { message: 'Password reset token generated', resetUrl };
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token || !newPassword) throw new BadRequestException('token and newPassword required');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.prisma.user.findFirst({ where: { resetPasswordToken: hashedToken, resetPasswordExpires: { gt: new Date() } } });
    if (!user) throw new BadRequestException('Invalid or expired token');

    const hashed = await bcrypt.hash(newPassword, 10);
    await this.prisma.user.update({ where: { id: user.id }, data: { password: hashed, resetPasswordToken: null, resetPasswordExpires: null } });

    return { message: 'Password has been reset' };
  }

  async createSignupRequest(dto: { name: string; email: string; roleRequested: string; message?: string; password?: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already in use');

    const existingReq = await this.prisma.signupRequest.findUnique({ where: { email: dto.email } });
    if (existingReq) throw new BadRequestException('A signup request with this email already exists');

    const req = await this.prisma.signupRequest.create({ data: { name: dto.name, email: dto.email, roleRequested: dto.roleRequested, message: dto.message, password: dto.password || null } });

    const superEmail = process.env.SUPERADMIN_EMAIL || 'espectro.ash@gmail.com';
    try {
      await this.mail.sendSignupNotification(superEmail, req);
    } catch (err) {
      console.error('Failed to send signup notification', err);
    }

    try {
      await this.prisma.auditLog.create({ data: { actorId: null, targetUserId: null, action: 'signup.request', meta: { email: dto.email, name: dto.name } } });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }

    return { message: 'Signup request submitted' };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Generate unique username
    let usernameBase = dto.name;
    if (!usernameBase && dto.firstName && dto.lastName) {
      usernameBase = `${dto.firstName}${dto.lastName}`.replace(/\s+/g, '').toLowerCase();
    }
    if (!usernameBase) {
      usernameBase = dto.email.split('@')[0];
    }

    // Check for username collision and append random bits if needed
    let finalUsername = usernameBase;
    const existingUsername = await this.prisma.user.findUnique({ where: { username: finalUsername } });
    if (existingUsername) {
      finalUsername = `${usernameBase}${crypto.randomBytes(2).toString('hex')}`;
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const hashedVerifyToken = crypto.createHash('sha256').update(verifyToken).digest('hex');
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        username: finalUsername,
        role: 'USER',
        emailVerified: false,
        emailVerifyToken: hashedVerifyToken,
        emailVerifyExpires: verifyExpires,
        title: dto.title,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneCountryCode: dto.phoneCountryCode,
        phoneNumber: dto.phoneNumber,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        marketingOptIn: dto.marketingOptIn ?? false,
        marketingEmails: dto.marketingEmails ?? false,
        marketingSms: dto.marketingSms ?? false,
        marketingTargetedAds: dto.marketingTargetedAds ?? false,
      },
    });

    const frontendBase = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verifyUrl = `${frontendBase}/verify-email?token=${verifyToken}`;
    await this.mail.sendEmailVerification(user.email, user.firstName || user.username, verifyUrl);

    return { message: 'Verification email sent' };
  }

  async verifyEmail(token: string) {
    if (!token) throw new BadRequestException('token required');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.prisma.user.findFirst({
      where: {
        emailVerifyToken: hashedToken,
        emailVerifyExpires: { gt: new Date() },
      },
    });
    if (!user) throw new BadRequestException('Invalid or expired token');

    const updated = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpires: null,
      },
    });

    const payload = { sub: updated.id, username: updated.username, role: updated.role };
    const access_token = this.jwtService.sign(payload);
    return { access_token };
  }

  async logout(refreshToken: string) {
    try {
      const payload: any = this.jwtService.verify(refreshToken);
      const userId = payload?.sub;
      if (!userId) return;
      await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    } catch (err) {
      // ignore
    }
  }
}
