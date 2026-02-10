import { Controller, Get } from '@nestjs/common';
import { AboutService } from '../about/about.service';

@Controller('about')
export class PublicAboutController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  async getPublic() {
    const about = await this.aboutService.get();
    const base = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 3000}`;

    const heroImageUrl =
      about.heroImageUrl && about.heroImageUrl.startsWith('/')
        ? `${base}${about.heroImageUrl}`
        : about.heroImageUrl;
    const craftImageUrl =
      about.craftImageUrl && about.craftImageUrl.startsWith('/')
        ? `${base}${about.craftImageUrl}`
        : about.craftImageUrl;

    const values = Array.isArray(about.values) ? about.values : [];

    return {
      id: about.id,
      heroTitle: about.heroTitle,
      heroImageUrl,
      visionTitle: about.visionTitle,
      visionParagraphs: about.visionParagraphs || [],
      craftTitle: about.craftTitle,
      craftParagraphs: about.craftParagraphs || [],
      craftImageUrl,
      valuesTitle: about.valuesTitle,
      values,
      ctaTitle: about.ctaTitle,
      ctaDescription: about.ctaDescription || null,
      ctaButtonText: about.ctaButtonText,
      ctaButtonUrl: about.ctaButtonUrl,
      isActive: about.isActive,
      createdAt: about.createdAt,
      updatedAt: about.updatedAt,
    };
  }
}
