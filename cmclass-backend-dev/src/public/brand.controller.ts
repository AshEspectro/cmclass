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
    const logoLight = brand.logoLightUrl && brand.logoLightUrl.startsWith('/') ? `${base}${brand.logoLightUrl}` : brand.logoLightUrl;
    const logoDark = brand.logoDarkUrl && brand.logoDarkUrl.startsWith('/') ? `${base}${brand.logoDarkUrl}` : brand.logoDarkUrl;
    const favicon = brand.faviconUrl && brand.faviconUrl.startsWith('/') ? `${base}${brand.faviconUrl}` : brand.faviconUrl;

    return {
      name: brand.name,
      slogan: brand.slogan || null,
      description: brand.description || null,
      contactEmail: brand.contactEmail || null,
      instagramUrl: brand.instagramUrl || null,
      facebookUrl: brand.facebookUrl || null,
      twitterUrl: brand.twitterUrl || null,
      pinterestUrl: brand.pinterestUrl || null,
      footerText: brand.footerText || null,
      logoUrl: logo,
      logoLightUrl: logoLight || null,
      logoDarkUrl: logoDark || null,
      faviconUrl: favicon,
      servicesHeaderTitle: brand.servicesHeaderTitle || null,
      servicesHeaderDescription: brand.servicesHeaderDescription || null,
    }
  }
}
