import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateHeroDto } from '../admin/dto/update-hero.dto';

@Injectable()
export class HeroService {
  constructor(private prisma: PrismaService) {}

  async get() {
    let hero = await this.prisma.heroSection.findFirst();

    // If no hero section exists, create one with defaults
    if (!hero) {
      hero = await this.prisma.heroSection.create({
        data: {
          mainText: 'Découvrez l\'Essence du Luxe',
          subtext: 'Explorez notre collection raffinée d\'élégance intemporelle',
          ctaButtonText: 'Découvrir',
          ctaButtonUrl: '/collections/nouveautes',
          mediaType: 'image',
          isActive: true,
        },
      });
    }

    return hero;
  }

  async upsert(data: UpdateHeroDto) {
    const hero = await this.get();

    return this.prisma.heroSection.update({
      where: { id: hero.id },
      data,
    });
  }
}
