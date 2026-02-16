"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let AboutService = class AboutService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    defaultData() {
        return {
            heroTitle: "L'ATELIER DE GOMA",
            heroImageUrl: 'https://images.unsplash.com/photo-1704729105381-f579cfcefd63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYXRlbGllciUyMHdvcmtzcGFjZSUyMG1pbmltYWx8ZW58MXx8fHwxNzYyMjU1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
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
            craftImageUrl: 'https://images.unsplash.com/photo-1620063224601-ead11b9737bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWlsb3JpbmclMjBzZXdpbmclMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjIyNTU3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
            valuesTitle: 'NOS VALEURS',
            values: [
                {
                    title: 'EXCELLENCE',
                    description: "Nous ne faisons aucun compromis sur la qualité. Chaque pièce est créée avec la plus grande attention aux détails et aux finitions.",
                },
                {
                    title: 'DURABILITÉ',
                    description: 'Nous créons des vêtements conçus pour durer, en privilégiant des matériaux nobles et des méthodes de production responsables.',
                },
                {
                    title: 'AUTHENTICITÉ',
                    description: "Nos créations célèbrent notre identité congolaise tout en s'inscrivant dans une esthétique minimaliste et contemporaine.",
                },
            ],
            ctaTitle: 'Nous contacter',
            ctaDescription: "Voulez-vous prendre rendez-vous avec nous pour découvrir nos créations ? N'hésitez pas à nous contacter pour toute demande d'information ou de collaboration. Nous sommes impatients de partager notre passion pour la mode avec vous.",
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
    async upsert(data) {
        const about = await this.get();
        const updateData = {
            ...data,
            values: data.values,
        };
        return this.prisma.aboutPage.update({
            where: { id: about.id },
            data: updateData,
        });
    }
};
exports.AboutService = AboutService;
exports.AboutService = AboutService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AboutService);
