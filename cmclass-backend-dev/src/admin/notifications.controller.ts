import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificationService } from '../notification/notification.service';

@Controller('admin/notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT')
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Get()
  async list(@Query('unreadOnly') unreadOnly?: string) {
    const unread = unreadOnly === 'true';
    const data = await this.notificationService.list(unread);
    return { data };
  }

  @Post()
  async create(@Body() body: { title: string; message: string; type?: string }) {
    const data = await this.notificationService.create(body);
    return { data };
  }

  @Patch(':id/read')
  async markRead(@Param('id', ParseIntPipe) id: number, @Body() body: { read?: boolean }) {
    const data = await this.notificationService.markRead(id, body.read ?? true);
    return { data };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.notificationService.delete(id);
    return { message: 'Notification deleted' };
  }
}
