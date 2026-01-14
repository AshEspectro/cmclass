import { Controller, Get, Query, Param, Post, Body, Patch, Delete, UseGuards, UploadedFile, UseInterceptors, Req, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MergeCategoriesDto } from './dto/merge-categories.dto';
import { BulkCategoriesDto } from './dto/bulk-categories.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

function filename(req: Request, file: any, cb: (err: any, name: string) => void) {
  const ext = file.originalname.split('.').pop();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  cb(null, name);
}

@Controller('admin/categories')
@Roles('ADMIN','SUPER_ADMIN')
export class CategoryController {
  constructor(private svc: CategoryService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async list(@Query('page') page = '1', @Query('pageSize') pageSize = '20', @Query('search') search = '', @Query('includeInactive') includeInactive = 'false') {
    const res = await this.svc.list({ page: Number(page), pageSize: Number(pageSize), search, includeInactive: includeInactive === 'true' });
    return res;
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() body: CreateCategoryDto) {
    const c = await this.svc.create(body as any);
    return { data: c };
  }

  @Post('merge')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async merge(@Body() body: MergeCategoriesDto) {
    return await this.svc.merge(body as any);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async reorder(@Body() body: Array<{ id: number; order: number }>) {
    return await this.svc.reorder(body as any);
  }

  @Post('bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async bulk(@Body() body: BulkCategoriesDto) {
    return await this.svc.bulkAction(body.ids, body.action);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = join(process.cwd(), 'public', 'uploads', 'categories');
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: filename as any,
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async upload(@UploadedFile() file: any, @Req() req: Request) {
    if (!file) throw new BadRequestException('No file uploaded');
    const url = `${req.protocol}://${req.get('host')}/uploads/categories/${file.filename}`;
    return { url };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async get(@Param('id', ParseIntPipe) id: number) {
    return { data: await this.svc.get(id) };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateCategoryDto) {
    const c = await this.svc.update(id, body as any);
    return { data: c };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    await this.svc.delete(Number(id));
    return { success: true };
  }
}
