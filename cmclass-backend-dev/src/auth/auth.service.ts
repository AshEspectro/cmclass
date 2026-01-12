import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService, private mail: MailService) {}

  private getGoogleClient() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
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

  /**
   * Social / OAuth login
   * For Google, `token` should be the ID token (id_token) returned by the Google sign-in flow.
   */
  async oauthLogin(provider: string, token: string, remember = false) {
    if (provider !== 'google') throw new BadRequestException('Unsupported provider');

    // verify id token with Google
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

    // find or create user
    let user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      const usernameBase = (payload?.name || email.split('@')[0]).replace(/\s+/g, '').toLowerCase();
      const randomSuffix = crypto.randomBytes(3).toString('hex');
      const username = `${usernameBase}${randomSuffix}`;
      const randomPassword = crypto.randomBytes(16).toString('hex');
      const hashed = await bcrypt.hash(randomPassword, 10);
      user = await this.prisma.user.create({ data: { username, email, password: hashed } });
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

    // In a production app you'd send this via email. For now we return the token and log it.
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password?token=${token}`;
    console.log('Password reset link (send via email):', resetUrl);

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

  // Signup request handling
  async createSignupRequest(dto: { name: string; email: string; roleRequested: string; message?: string; password?: string }) {
    // ensure email not already used
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new BadRequestException('Email already in use');

    const existingReq = await this.prisma.signupRequest.findUnique({ where: { email: dto.email } });
    if (existingReq) throw new BadRequestException('A signup request with this email already exists');

    // Store the user-provided password temporarily (will be cleared when processed). In production consider encrypting or avoiding storing raw passwords.
    const req = await this.prisma.signupRequest.create({ data: { name: dto.name, email: dto.email, roleRequested: dto.roleRequested, message: dto.message, password: dto.password || null } });

    // notify superadmin via email
    const superEmail = process.env.SUPERADMIN_EMAIL || 'espectro.ash@gmail.com';
    try {
      await this.mail.sendSignupNotification(superEmail, req);
    } catch (err) {
      // log but do not fail
      console.error('Failed to send signup notification', err);
    }

    // Audit
    try {
      await this.prisma.auditLog.create({ data: { actorId: null, targetUserId: null, action: 'signup.request', meta: { email: dto.email, name: dto.name } } });
    } catch (e) {
      console.error('Failed to write audit log', e);
    }

    return { message: 'Signup request submitted' };
  }

  async logout(refreshToken: string) {
    try {
      const payload: any = this.jwtService.verify(refreshToken);
      const userId = payload?.sub;
      if (!userId) return;
      await this.prisma.user.update({ where: { id: userId }, data: { refreshToken: null } });
    } catch (err) {
      // ignore invalid token
    }
  }
}
