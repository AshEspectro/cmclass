import { Controller, Get } from '@nestjs/common';
import { HeroService } from '../hero/hero.service';

@Controller('hero')
export class PublicHeroController {
  constructor(private readonly heroService: HeroService) {}

  @Get()
  async getPublic() {
    const hero = await this.heroService.get();
    const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;

    return {
      id: hero.id,
      mainText: hero.mainText,
      subtext: hero.subtext,
      backgroundImageUrl: hero.backgroundImageUrl && hero.backgroundImageUrl.startsWith('/') ? `${base}${hero.backgroundImageUrl}` : hero.backgroundImageUrl,
      backgroundVideoUrl: hero.backgroundVideoUrl && hero.backgroundVideoUrl.startsWith('/') ? `${base}${hero.backgroundVideoUrl}` : hero.backgroundVideoUrl,
      mediaType: hero.mediaType,
      ctaButtonText: hero.ctaButtonText,
      ctaButtonUrl: hero.ctaButtonUrl,
      isActive: hero.isActive,
      createdAt: hero.createdAt,
      updatedAt: hero.updatedAt,
    };
  }
}
