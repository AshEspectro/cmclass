import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FooterService } from '../footer/footer.service';

@Controller('admin/footer')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class FooterController {
  constructor(private readonly footerService: FooterService) {}

  @Get('sections')
  async listSections() {
    const sections = await this.footerService.listAll();
    return { data: sections };
  }

  @Post('sections')
  async createSection(@Body() body: { title: string; order?: number; isActive?: boolean }) {
    const created = await this.footerService.createSection(body);
    return { data: created };
  }

  @Patch('sections/:id')
  async updateSection(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { title?: string; order?: number; isActive?: boolean },
  ) {
    const updated = await this.footerService.updateSection(id, body);
    return { data: updated };
  }

  @Delete('sections/:id')
  async deleteSection(@Param('id', ParseIntPipe) id: number) {
    await this.footerService.deleteSection(id);
    return { message: 'Section deleted' };
  }

  @Post('sections/:id/links')
  async createLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { label: string; url: string; order?: number; isActive?: boolean },
  ) {
    const created = await this.footerService.createLink(id, body);
    return { data: created };
  }

  @Patch('links/:id')
  async updateLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { label?: string; url?: string; order?: number; isActive?: boolean },
  ) {
    const updated = await this.footerService.updateLink(id, body);
    return { data: updated };
  }

  @Delete('links/:id')
  async deleteLink(@Param('id', ParseIntPipe) id: number) {
    await this.footerService.deleteLink(id);
    return { message: 'Link deleted' };
  }
}
