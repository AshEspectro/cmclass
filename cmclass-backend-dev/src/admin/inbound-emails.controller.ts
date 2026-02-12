import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { InboundEmailService } from '../mail/inbound-email.service';

@Controller('admin/inbound-emails')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN', 'MODERATOR', 'SUPPORT')
export class InboundEmailsController {
  constructor(private readonly service: InboundEmailService) {}

  @Get()
  async list(
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
    @Query('search') search = '',
    @Query('includeArchived') includeArchived = 'false',
  ) {
    return await this.service.list({
      page: Number(page),
      pageSize: Number(pageSize),
      search,
      includeArchived: includeArchived === 'true',
    });
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.get(id);
    return { data };
  }

  @Patch(':id/archive')
  async archive(@Param('id', ParseIntPipe) id: number, @Body() body: { archived?: boolean }) {
    const data = await this.service.archive(id, body?.archived ?? true);
    return { data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { message: 'Inbound email deleted' };
  }
}
