import { Controller, Get } from '@nestjs/common'
import { BrandService } from '../brand/brand.service'

@Controller('brand')
export class PublicBrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  async getPublic() {
    const brand = await this.brandService.get()
    const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;

    const logo = brand.logoUrl && brand.logoUrl.startsWith('/') ? `${base}${brand.logoUrl}` : brand.logoUrl;
    const favicon = brand.faviconUrl && brand.faviconUrl.startsWith('/') ? `${base}${brand.faviconUrl}` : brand.faviconUrl;

    return {
      name: brand.name,
      logoUrl: logo,
      faviconUrl: favicon,
    }
  }
}
