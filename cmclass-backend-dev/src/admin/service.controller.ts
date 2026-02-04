import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, ParseIntPipe } from '@nestjs/common';
import { ServiceService } from './service.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('admin/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class ServiceController {
  constructor(private serviceService: ServiceService) {}

  @Get()
  async list() {
    const services = await this.serviceService.list();
    return { data: services };
  }

  @Get(':id')
  async get(@Param('id', ParseIntPipe) id: number) {
    const s = await this.serviceService.get(id);
    return { data: s };
  }

  @Post()
  async create(@Body() body: any) {
    const s = await this.serviceService.create(body);
    return { data: s };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    const s = await this.serviceService.update(id, body);
    return { data: s };
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    await this.serviceService.delete(id);
    return { message: 'Service deleted' };
  }
}
