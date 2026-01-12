import { Controller, Get, Query, Param, Post, Body, Patch, Delete, UseGuards, UploadedFile, UseInterceptors, Req, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request } from 'express';

function filename(req: Request, file: any, cb: (err: any, name: string) => void) {
  const ext = file.originalname.split('.').pop();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  cb(null, name);
}

@Controller('admin/products')
@Roles('ADMIN')
export class ProductController {
  constructor(private svc: ProductService) {}

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
  async create(@Body() body: CreateProductDto) {
    const c = await this.svc.create(body as any);
    return { data: c };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(@Param('id') id: string, @Body() body: UpdateProductDto) {
    const c = await this.svc.update(Number(id), body as any);
    return { data: c };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id') id: string) {
    await this.svc.delete(Number(id));
    return { success: true };
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const dest = join(process.cwd(), 'public', 'uploads', 'products');
        if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: filename as any,
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async upload(@UploadedFile() file: any, @Req() req: Request) {
    if (!file) throw new BadRequestException('No file uploaded');
    const url = `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`;
    return { url };
  }
}
