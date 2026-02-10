import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { publicApi } from '../services/publicApi';

type ValueItem = { title: string; description: string };

interface AboutData {
  heroTitle: string;
  heroImageUrl?: string | null;
  visionTitle: string;
  visionParagraphs: string[];
  craftTitle: string;
  craftParagraphs: string[];
  craftImageUrl?: string | null;
  valuesTitle: string;
  values: ValueItem[];
  ctaTitle: string;
  ctaDescription?: string | null;
  ctaButtonText: string;
  ctaButtonUrl: string;
}

const FALLBACK_ABOUT: AboutData = {
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
  ],
  ctaTitle: 'Nous contacter',
  ctaDescription:
    "Voulez-vous prendre rendez-vous avec nous pour découvrir nos créations ? N'hésitez pas à nous contacter pour toute demande d'information ou de collaboration. Nous sommes impatients de partager notre passion pour la mode avec vous.",
  ctaButtonText: 'Nous contacter',
  ctaButtonUrl: '/contact',
};

const normalizeAbout = (data: Partial<AboutData> | null | undefined): AboutData => {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return FALLBACK_ABOUT;
  }

  return {
    ...FALLBACK_ABOUT,
    ...data,
    heroTitle:
      typeof data.heroTitle === 'string' && data.heroTitle.trim().length > 0
        ? data.heroTitle
        : FALLBACK_ABOUT.heroTitle,
    heroImageUrl:
      typeof data.heroImageUrl === 'string' && data.heroImageUrl.trim().length > 0
        ? data.heroImageUrl
        : FALLBACK_ABOUT.heroImageUrl,
    visionTitle:
      typeof data.visionTitle === 'string' && data.visionTitle.trim().length > 0
        ? data.visionTitle
        : FALLBACK_ABOUT.visionTitle,
    craftTitle:
      typeof data.craftTitle === 'string' && data.craftTitle.trim().length > 0
        ? data.craftTitle
        : FALLBACK_ABOUT.craftTitle,
    craftImageUrl:
      typeof data.craftImageUrl === 'string' && data.craftImageUrl.trim().length > 0
        ? data.craftImageUrl
        : FALLBACK_ABOUT.craftImageUrl,
    valuesTitle:
      typeof data.valuesTitle === 'string' && data.valuesTitle.trim().length > 0
        ? data.valuesTitle
        : FALLBACK_ABOUT.valuesTitle,
    ctaTitle:
      typeof data.ctaTitle === 'string' && data.ctaTitle.trim().length > 0
        ? data.ctaTitle
        : FALLBACK_ABOUT.ctaTitle,
    ctaDescription:
      typeof data.ctaDescription === 'string' ? data.ctaDescription : FALLBACK_ABOUT.ctaDescription,
    ctaButtonText:
      typeof data.ctaButtonText === 'string' && data.ctaButtonText.trim().length > 0
        ? data.ctaButtonText
        : FALLBACK_ABOUT.ctaButtonText,
    ctaButtonUrl:
      typeof data.ctaButtonUrl === 'string' && data.ctaButtonUrl.trim().length > 0
        ? data.ctaButtonUrl
        : FALLBACK_ABOUT.ctaButtonUrl,
    visionParagraphs: Array.isArray(data.visionParagraphs) ? data.visionParagraphs : FALLBACK_ABOUT.visionParagraphs,
    craftParagraphs: Array.isArray(data.craftParagraphs) ? data.craftParagraphs : FALLBACK_ABOUT.craftParagraphs,
    values: Array.isArray(data.values) ? (data.values as ValueItem[]) : FALLBACK_ABOUT.values,
  };
};

export const About = () => {
  const [about, setAbout] = useState<AboutData>(FALLBACK_ABOUT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchAbout = async () => {
      try {
        const data = await publicApi.getAbout();
        if (!active) return;
        setAbout(normalizeAbout(data as Partial<AboutData>));
      } catch (error) {
        console.error('Error fetching about content:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchAbout();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="pt-20 sm:pt-24" aria-busy={loading}>
      {/* Hero Image */}
      <section className="relative h-[80vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${about.heroImageUrl})` }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative h-full flex items-end pb-20">
          <div className="max-w-[1440px] mx-auto px-6 lg:px-12 w-full">
            <motion.h1
              className="text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {about.heroTitle}
            </motion.h1>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-8 text-center">{about.visionTitle}</h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              {about.visionParagraphs.map((paragraph, index) => (
                <p key={`vision-${index}`}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Craft Section */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-6">{about.craftTitle}</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                {about.craftParagraphs.map((paragraph, index) => (
                  <p key={`craft-${index}`}>{paragraph}</p>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="aspect-[4/5] bg-gray-200 overflow-hidden"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <img
                src={about.craftImageUrl || ''}
                alt={about.craftTitle}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
          <motion.h2
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {about.valuesTitle}
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            {about.values.map((value, index) => (
              <motion.div
                key={`value-${value.title}-${index}`}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <h3 className="mb-4">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-black text-white">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 text-center">
          <motion.div
            className="max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-white mb-6">{about.ctaTitle}</h2>
            {about.ctaDescription && (
              <p className="text-white/80 mb-10">{about.ctaDescription}</p>
            )}
            <Link
              to={about.ctaButtonUrl}
              className="inline-block bg-[#007B8A] text-white rounded-full px-12 py-4 hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              {about.ctaButtonText}
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
