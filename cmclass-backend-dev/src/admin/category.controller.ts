import { Controller, Get, Query, Param, Post, Body, Patch, Delete, UseGuards, UploadedFile, UseInterceptors, Req, BadRequestException, ParseIntPipe } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { MergeCategoriesDto } from './dto/merge-categories.dto';
import { BulkCategoriesDto } from './dto/bulk-categories.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('admin/categories')
@Roles('ADMIN', 'SUPER_ADMIN')
export class CategoryController {
  constructor(
    private svc: CategoryService,
    private cloudinaryService: CloudinaryService
  ) { }

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
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    // Upload to Cloudinary
    const url = await this.cloudinaryService.uploadFile(file, 'categories');

    return { url };
  }

  @Post(':parentId/subcategories')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createSubcategory(
    @Param('parentId', ParseIntPipe) parentId: number,
    @Body() body: CreateCategoryDto
  ) {
    // Generate hierarchical slug
    const slug = await this.svc.makeSubcategorySlug(parentId, body.name);
    const c = await this.svc.create({
      ...body,
      slug,
      parentId,
    } as any);
    return { data: c };
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
