import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

const atelierImage = 'https://images.unsplash.com/photo-1704729105381-f579cfcefd63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYXRlbGllciUyMHdvcmtzcGFjZSUyMG1pbmltYWx8ZW58MXx8fHwxNzYyMjU1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080';
const craftImage = 'https://images.unsplash.com/photo-1620063224601-ead11b9737bf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0YWlsb3JpbmclMjBzZXdpbmclMjB3b3Jrc2hvcHxlbnwxfHx8fDE3NjIyNTU3NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080';

export const About = () => {
  return (
    <div className="pt-20 sm:pt-24">
      {/* Hero Image */}
      <section className="relative h-[80vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${atelierImage})` }}
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
              L'ATELIER DE GOMA
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
            <h2 className="mb-8 text-center">NOTRE VISION</h2>
            <div className="space-y-6 text-gray-600 leading-relaxed text-lg">
              <p>
                CM CLASS est né à Goma, au cœur du Nord-Kivu, avec une vision claire : créer une mode masculine 
                qui célèbre l'artisanat congolais tout en embrassant une esthétique minimaliste et contemporaine.
              </p>
              <p>
                Nous croyons que chaque vêtement raconte une histoire. Celle de nos artisans, de leurs mains 
                expertes qui transforment des matériaux nobles en pièces d'exception. Celle d'une ville, Goma, 
                résiliente et créative, qui inspire notre approche du design.
              </p>
              <p>
                Notre démarche est guidée par trois piliers fondamentaux : l'excellence artisanale, la durabilité 
                et le respect de notre héritage culturel. Chaque collection est pensée pour transcender les tendances 
                éphémères et offrir des pièces intemporelles à l'homme moderne qui valorise l'authenticité.
              </p>
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
              <h2 className="mb-6">ARTISANAT & SAVOIR-FAIRE</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Nos ateliers à Goma perpétuent des techniques ancestrales de couture et de tissage, 
                  transmises de génération en génération. Chaque artisan apporte sa maîtrise unique au 
                  processus de création.
                </p>
                <p>
                  Du choix des matières premières aux finitions minutieuses, nous accordons une attention 
                  particulière à chaque étape de fabrication. Cette exigence de qualité garantit des vêtements 
                  durables qui vieillissent avec élégance.
                </p>
                <p>
                  En travaillant exclusivement avec des artisans locaux, nous soutenons l'économie de notre 
                  région et préservons un patrimoine de compétences irremplaçables.
                </p>
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
                src={craftImage}
                alt="Artisanat"
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
            NOS VALEURS
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-12 lg:gap-16">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="mb-4">EXCELLENCE</h3>
              <p className="text-gray-600 leading-relaxed">
                Nous ne faisons aucun compromis sur la qualité. Chaque pièce est créée avec 
                la plus grande attention aux détails et aux finitions.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="mb-4">DURABILITÉ</h3>
              <p className="text-gray-600 leading-relaxed">
                Nous créons des vêtements conçus pour durer, en privilégiant des matériaux 
                nobles et des méthodes de production responsables.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="mb-4">AUTHENTICITÉ</h3>
              <p className="text-gray-600 leading-relaxed">
                Nos créations célèbrent notre identité congolaise tout en s'inscrivant 
                dans une esthétique minimaliste et contemporaine.
              </p>
            </motion.div>
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
            <h2 className="text-white mb-6">DÉCOUVREZ NOS CRÉATIONS</h2>
            <p className="text-white/80 mb-10">
              Explorez notre collection homme et trouvez les pièces qui vous ressemblent
            </p>
            <Link
              to="/homme"
              className="inline-block bg-[#007B8A] text-white px-12 py-4 hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              VOIR LA COLLECTION
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
