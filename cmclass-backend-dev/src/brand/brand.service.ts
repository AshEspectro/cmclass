import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateBrandDto } from '../admin/dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let brand = await this.prisma.brand.findFirst();
    if (!brand) {
      brand = await this.prisma.brand.create({ data: {} as any });
    }
    // Normalize any stored URLs that include /public/ path segment
    if (brand.logoUrl) brand.logoUrl = brand.logoUrl.replace('/public/', '/');
    if (brand.logoLightUrl) brand.logoLightUrl = brand.logoLightUrl.replace('/public/', '/');
    if (brand.logoDarkUrl) brand.logoDarkUrl = brand.logoDarkUrl.replace('/public/', '/');
    if (brand.faviconUrl) brand.faviconUrl = brand.faviconUrl.replace('/public/', '/');
    return brand;
  }

  async upsert(data: UpdateBrandDto) {
    // use id = 1 as singleton key
    const values: any = { ...data };
    const brand = await this.prisma.brand.upsert({
      where: { id: 1 },
      create: { id: 1, ...values },
      update: values,
    });
    // Normalize returned URLs
    if (brand.logoUrl) brand.logoUrl = brand.logoUrl.replace('/public/', '/');
    if (brand.logoLightUrl) brand.logoLightUrl = brand.logoLightUrl.replace('/public/', '/');
    if (brand.logoDarkUrl) brand.logoDarkUrl = brand.logoDarkUrl.replace('/public/', '/');
    if (brand.faviconUrl) brand.faviconUrl = brand.faviconUrl.replace('/public/', '/');
    return brand;
  }
}
