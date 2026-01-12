import { Controller, Get, Patch, Body, Post, UseGuards, UploadedFile, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { BrandService } from '../brand/brand.service';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';
import { existsSync, mkdirSync } from 'fs';

function filename(req: Request, file: Express.Multer.File, cb: (err: any, name: string) => void) {
  const ext = file.originalname.split('.').pop();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  cb(null, name);
}

@Controller('admin/brand')
@Roles('ADMIN')
export class BrandController {
  constructor(private brandService: BrandService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getBrand() {
    return { data: await this.brandService.get() };
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Body() body: UpdateBrandDto) {
    const brand = await this.brandService.upsert(body);
    return { data: brand };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = join(process.cwd(), 'public', 'uploads', 'brand');
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: filename as any,
    }),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  }))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req: Request) {
    if (!file) throw new BadRequestException('No file uploaded');
    // Serve uploads from root '/uploads' (Nest static assets are mounted at '/'), not '/public/uploads'
    const url = `${req.protocol}://${req.get('host')}/uploads/brand/${file.filename}`;
    return { url };
  }
}