import { Controller, Get, Patch, Body, Post, UseGuards, UploadedFile, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { HeroService } from '../hero/hero.service';
import { UpdateHeroDto } from './dto/update-hero.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs';

function filename(req: Request, file: Express.Multer.File, cb: (err: any, name: string) => void) {
  const ext = file.originalname.split('.').pop();
  const name = `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  cb(null, name);
}

@Controller('admin/hero')
@Roles('ADMIN', 'SUPER_ADMIN')
export class HeroController {
  constructor(private heroService: HeroService) {}

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
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = join(process.cwd(), 'public', 'uploads', 'hero');
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: filename as any,
    }),
    limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
    fileFilter: (req, file, cb) => {
      const allowedMimes = ['image/png', 'image/jpeg', 'image/webp'];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('Only PNG, JPG, and WebP files are allowed'), false);
      }
    },
  }))
  async uploadImage(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('No file uploaded');
    const url = `${req.protocol}://${req.get('host')}/uploads/hero/${file.filename}`;
    return { url };
  }

  @Post('upload-video')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = join(process.cwd(), 'public', 'uploads', 'hero');
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: filename as any,
    }),
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
  async uploadVideo(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('No file uploaded');
    const url = `${req.protocol}://${req.get('host')}/uploads/hero/${file.filename}`;
    return { url };
  }
}
