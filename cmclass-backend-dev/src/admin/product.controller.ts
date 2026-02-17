import { Controller, Get, Query, Param, Post, Body, Patch, Delete, UseGuards, UploadedFile, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { NotificationService } from '../notification/notification.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('admin/products')
@Roles('ADMIN')
export class ProductController {
  constructor(
    private svc: ProductService,
    private notificationService: NotificationService,
    private cloudinaryService: CloudinaryService
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async list(@Query('page') page = '1', @Query('pageSize') pageSize = '20', @Query('search') search = '') {
    const res = await this.svc.list({ page: Number(page), pageSize: Number(pageSize), search });
    return res;
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async get(@Param('id') id: string) {
    return { data: await this.svc.get(Number(id)) };
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() body: CreateProductDto, @Req() req: any) {
    const c = await this.svc.create(body as any);

    await this.notificationService.create({
      title: 'Nouveau produit ajouté',
      message: `Le produit "${c.name}" a été ajouté par ${req.user.username}.`,
      type: 'PRODUCT_CREATE',
    });

    return { data: c };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() body: UpdateProductDto, @Req() req: any) {
    const c = await this.svc.update(Number(id), body as any);

    await this.notificationService.create({
      title: 'Produit mis à jour',
      message: `Le produit "${c.name}" (#${id}) a été mis à jour par ${req.user.username}.`,
      type: 'PRODUCT_UPDATE',
    });

    return { data: c };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.svc.delete(Number(id));

    await this.notificationService.create({
      title: 'Produit supprimé',
      message: `Le produit #${id} a été supprimé par ${req.user.username}.`,
      type: 'PRODUCT_DELETE',
    });

    return { success: true };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  }))
  async upload(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    // Upload to Cloudinary
    const url = await this.cloudinaryService.uploadFile(file, 'products');

    return { url };
  }
}
