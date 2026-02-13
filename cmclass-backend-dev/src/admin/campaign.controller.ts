import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificationService } from '../notification/notification.service';

@Controller('admin/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class CampaignController {
  constructor(
    private campaignService: CampaignService,
    private notificationService: NotificationService
  ) { }

  @Get()
  async list() {
    const campaigns = await this.campaignService.list();
    return { data: campaigns };
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const campaign = await this.campaignService.get(id);
    return { data: campaign };
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const campaign = await this.campaignService.create(body);

    await this.notificationService.create({
      title: 'Nouvelle campagne créée',
      message: `La campagne "${campaign.title}" a été créée par ${req.user.username}.`,
      type: 'CAMPAIGN_CREATE',
    });

    return { data: campaign };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) {
    const campaign = await this.campaignService.update(id, body);

    await this.notificationService.create({
      title: 'Campagne mise à jour',
      message: `La campagne "${campaign.title}" (#${id}) a été mise à jour par ${req.user.username}.`,
      type: 'CAMPAIGN_UPDATE',
    });

    return { data: campaign };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    await this.campaignService.delete(id);

    await this.notificationService.create({
      title: 'Campagne supprimée',
      message: `Une campagne (#${id}) a été supprimée par ${req.user.username}.`,
      type: 'CAMPAIGN_DELETE',
    });

    return { message: 'Campaign deleted' };
  }
}
