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
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/campaigns')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

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
  async create(@Body() body: any) {
    const campaign = await this.campaignService.create(body);
    return { data: campaign };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const campaign = await this.campaignService.update(id, body);
    return { data: campaign };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.campaignService.delete(id);
    return { message: 'Campaign deleted' };
  }
}
