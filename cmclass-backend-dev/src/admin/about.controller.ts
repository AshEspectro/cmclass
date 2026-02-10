import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { AboutService } from '../about/about.service';
import { UpdateAboutDto } from './dto/update-about.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/about')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AboutController {
  constructor(private aboutService: AboutService) {}

  @Get()
  async getAbout() {
    const about = await this.aboutService.get();
    return { data: about };
  }

  @Patch()
  async updateAbout(@Body() body: UpdateAboutDto) {
    const about = await this.aboutService.upsert(body);
    return { data: about };
  }
}
