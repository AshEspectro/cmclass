import { Controller, Get, Patch, Body, Post, UseGuards, UploadedFile, UseInterceptors, BadRequestException, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { BrandService } from '../brand/brand.service';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificationService } from '../notification/notification.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('admin/brand')
@Roles('ADMIN', 'SUPER_ADMIN')
export class BrandController {
  constructor(
    private brandService: BrandService,
    private notificationService: NotificationService,
    private cloudinaryService: CloudinaryService
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getBrand() {
    return { data: await this.brandService.get() };
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Body() body: UpdateBrandDto, @Req() req: any) {
    const brand = await this.brandService.upsert(body);

    await this.notificationService.create({
      title: 'Configuration de marque mise à jour',
      message: `L'administrateur ${req.user.username} a mis à jour les paramètres de la marque.`,
      type: 'BRAND_UPDATE',
    });

    return { data: brand };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    // Upload to Cloudinary
    const url = await this.cloudinaryService.uploadFile(file, 'brand');

    return { url };
  }
}