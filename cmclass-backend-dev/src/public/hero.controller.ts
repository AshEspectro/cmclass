import { Controller, Get } from '@nestjs/common';
import { HeroService } from '../hero/hero.service';

@Controller('hero')
export class PublicHeroController {
  constructor(private readonly heroService: HeroService) { }

  @Get()
  async getPublic() {
    const hero = await this.heroService.get();

    // Prefer VITE_API_URL or PUBLIC_ASSET_URL for production
    const base = process.env.VITE_API_URL || process.env.PUBLIC_ASSET_URL || `http://localhost:${process.env.PORT || 3000}`;

    // Helper to normalize URLs
    const getUrl = (url: string | null) => {
      if (!url) return null;
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
    };

    return {
      id: hero.id,
      mainText: hero.mainText,
      subtext: hero.subtext,
      backgroundImageUrl: getUrl(hero.backgroundImageUrl),
      backgroundVideoUrl: getUrl(hero.backgroundVideoUrl),
      mediaType: hero.mediaType,
      ctaButtonText: hero.ctaButtonText,
      ctaButtonUrl: hero.ctaButtonUrl,
      isActive: hero.isActive,
      createdAt: hero.createdAt,
      updatedAt: hero.updatedAt,
    };
  }
}
