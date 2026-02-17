import { Controller, Get, Patch, Body, Post, UseGuards, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { HeroService } from '../hero/hero.service';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Controller('admin/hero')
@Roles('ADMIN', 'SUPER_ADMIN')
export class HeroController {
  constructor(
    private heroService: HeroService,
    private cloudinaryService: CloudinaryService
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getHero() {
    const hero = await this.heroService.get();
    return { data: hero };
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async updateHero(@Body() body: UpdateHeroDto) {
    const hero = await this.heroService.upsert(body);
    return { data: hero };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/png', 'image/jpeg', 'image/webp', 'image/jpg'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only PNG, JPG, and WebP files are allowed'), false);
      }
    },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    // Upload to Cloudinary
    const url = await this.cloudinaryService.uploadFile(file, 'hero');

    return { url };
  }

  @Post('upload-video')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB for videos
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only MP4, WebM, and OGG video files are allowed'), false);
      }
    },
  }))
  async uploadVideo(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file uploaded');

    // Upload to Cloudinary
    const url = await this.cloudinaryService.uploadFile(file, 'hero');

    return { url };
  }
}
