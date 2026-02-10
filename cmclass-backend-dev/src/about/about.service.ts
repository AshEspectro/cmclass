import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateAboutDto } from '../admin/dto/update-about.dto';

@Injectable()
export class AboutService {
  constructor(private prisma: PrismaService) {}

  private defaultData() {
    return {
      heroTitle: "L'ATELIER DE GOMA",
      heroImageUrl:
        'https://images.unsplash.com/photo-1704729105381-f579cfcefd63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYXRlbGllciUyMHdvcmtzcGFjZSUyMG1pbmltYWx8ZW58MXx8fHwxNzYyMjU1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
      visionTitle: 'NOTRE VISION',
      visionParagraphs: [
        "CM CLASS est né à Goma, au cœur du Nord-Kivu, avec une vision claire : créer une mode masculine qui célèbre l'artisanat congolais tout en embrassant une esthétique minimaliste et contemporaine.",
        "Nous croyons que chaque vêtement raconte une histoire. Celle de nos artisans, de leurs mains expertes qui transforment des matériaux nobles en pièces d'exception. Celle d'une ville, Goma, résiliente et créative, qui inspire notre approche du design.",
        "Notre démarche est guidée par trois piliers fondamentaux : l'excellence artisanale, la durabilité et le respect de notre héritage culturel. Chaque collection est pensée pour transcender les tendances éphémères et offrir des pièces intemporelles à l'homme moderne qui valorise l'authenticité.",
      ],
      craftTitle: 'ARTISANAT & SAVOIR-FAIRE',
      craftParagraphs: [
        'Nos ateliers à Goma perpétuent des techniques ancestrales de couture et de tissage, transmises de génération en génération. Chaque artisan apporte sa maîtrise unique au processus de création.',
        "Du choix des matières premières aux finitions minutieuses, nous accordons une attention particulière à chaque étape de fabrication. Cette exigence de qualité garantit des vêtements durables qui vieillissent avec élégance.",
        "En travaillant exclusivement avec des artisans locaux, nous soutenons l'économie de notre région et préservons un patrimoine de compétences irremplaçables.",
      ],
      craftImageUrl:
        'https://images.unsplash.com/photo-1620063224601-ead11b9737bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWlsb3JpbmclMjBzZXdpbmclMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjIyNTU3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
      valuesTitle: 'NOS VALEURS',
      values: [
        {
          title: 'EXCELLENCE',
          description:
            "Nous ne faisons aucun compromis sur la qualité. Chaque pièce est créée avec la plus grande attention aux détails et aux finitions.",
        },
        {
          title: 'DURABILITÉ',
          description:
            'Nous créons des vêtements conçus pour durer, en privilégiant des matériaux nobles et des méthodes de production responsables.',
        },
        {
          title: 'AUTHENTICITÉ',
          description:
            "Nos créations célèbrent notre identité congolaise tout en s'inscrivant dans une esthétique minimaliste et contemporaine.",
        },
      ] as any,
      ctaTitle: 'Nous contacter',
      ctaDescription:
        "Voulez-vous prendre rendez-vous avec nous pour découvrir nos créations ? N'hésitez pas à nous contacter pour toute demande d'information ou de collaboration. Nous sommes impatients de partager notre passion pour la mode avec vous.",
      ctaButtonText: 'Nous contacter',
      ctaButtonUrl: '/contact',
      isActive: true,
    };
  }

  async get() {
    let about = await this.prisma.aboutPage.findFirst({ orderBy: { id: 'asc' } });
    if (!about) {
      about = await this.prisma.aboutPage.create({
        data: this.defaultData(),
      });
    }
    return about;
  }

  async upsert(data: UpdateAboutDto) {
    const about = await this.get();
    const updateData: Prisma.AboutPageUpdateInput = {
      ...data,
      values: data.values as Prisma.InputJsonValue | undefined,
    };
    return this.prisma.aboutPage.update({
      where: { id: about.id },
      data: updateData,
    });
  }
}
