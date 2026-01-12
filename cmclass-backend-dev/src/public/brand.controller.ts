import { Controller, Get } from '@nestjs/common'
import { BrandService } from '../brand/brand.service'

@Controller('brand')
export class PublicBrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  async getPublic() {
    const brand = await this.brandService.get()

    return {
      name: brand.name,
      logoUrl: brand.logoUrl,
      faviconUrl: brand.faviconUrl,
    }
  }
}
