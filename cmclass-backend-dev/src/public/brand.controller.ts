import { Controller, Get } from '@nestjs/common'
import { BrandService } from '../brand/brand.service'

@Controller('brand')
export class PublicBrandController {
  constructor(private readonly brandService: BrandService) { }

  @Get()
  async getPublic() {
    const brand = await this.brandService.get()

    // Prefer VITE_API_URL or PUBLIC_ASSET_URL for production
    const base = process.env.VITE_API_URL || process.env.PUBLIC_ASSET_URL || `http://localhost:${process.env.PORT || 3000}`;

    // Helper to normalize URLs
    const getUrl = (url: string | null) => {
      if (!url) return null;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return {
      name: brand.name,
      slogan: brand.slogan || null,
      description: brand.description || null,
      storefrontCurrency: brand.storefrontCurrency === 'USD' ? 'USD' : 'FC',
      contactEmail: brand.contactEmail || null,
      contactPhone: brand.contactPhone || null,
      contactAddress: brand.contactAddress || null,
      openingHours: brand.openingHours || null,
      instagramUrl: brand.instagramUrl || null,
      facebookUrl: brand.facebookUrl || null,
      twitterUrl: brand.twitterUrl || null,
      pinterestUrl: brand.pinterestUrl || null,
      footerText: brand.footerText || null,
      logoUrl: getUrl(brand.logoUrl),
      logoLightUrl: getUrl(brand.logoLightUrl),
      logoDarkUrl: getUrl(brand.logoDarkUrl),
      faviconUrl: getUrl(brand.faviconUrl),
      servicesHeaderTitle: brand.servicesHeaderTitle || null,
      servicesHeaderDescription: brand.servicesHeaderDescription || null,
    }
  }
}
