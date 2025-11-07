import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { Newsletter } from '../components/Newsletter';
import { products, collections } from '../data/products';
import type { Product } from '../data/products';

const heroImage = 'https://images.unsplash.com/photo-1761522002366-870191e79f2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbGUlMjBtb2RlbCUyMHdoaXRlJTIwYmFja2dyb3VuZCUyMGZhc2hpb258ZW58MXx8fHwxNzYyMjU1NzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080';
const atelierImage = 'https://images.unsplash.com/photo-1704729105381-f579cfcefd63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYXRlbGllciUyMHdvcmtzcGFjZSUyMG1pbmltYWx8ZW58MXx8fHwxNzYyMjU1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080';
const editorialImage = 'https://images.unsplash.com/photo-1698444056939-ba73e533d006?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFuJTIwZm9ybWFsJTIwd2VhciUyMHN0dWRpb3xlbnwxfHx8fDE3NjIyNTU3NDV8MA&ixlib=rb-4.1.0&q=80&w=1080';
const collectionImage1 = 'https://images.unsplash.com/photo-1596216180471-61379344936c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbiUyMGZhc2hpb24lMjBtaW5pbWFsJTIwd2hpdGV8ZW58MXx8fHwxNzYyMjU1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080';
const collectionImage2 = 'https://images.unsplash.com/photo-1617724757497-79b54c5444d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1vZGVsJTIwY2FzdWFsJTIwd2VhcnxlbnwxfHx8fDE3NjIyNTU3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080';

export const Home = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const featuredProducts = products.filter(p => p.category === 'HOMME').slice(0, 8);

  return (
    <div>
      {/* Hero Section */}
      <Hero
        image={heroImage}
        title="L'ESSENCE DU STYLE CONGOLAIS"
        subtitle="Collection Homme Automne-Hiver 2025"
        ctaText="DÉCOUVRIR LA COLLECTION HOMME"
        ctaLink="/homme"
      />

      {/* Featured Collections */}
      <section className="py-16 sm:py-20 md:py-24 lg:py-32"
        style={{ marginTop: '80px' }}>
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.h2
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            COLLECTIONS
          </motion.h2>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            <motion.div
              className="relative group overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0 }}
            >
              <Link to="/homme" className="block">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img
                    src={collectionImage1}
                    alt="Collection Homme"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="mt-3 sm:mt-4 text-center">
                  <h3 className="mb-1 sm:mb-2 text-sm sm:text-base md:text-lg group-hover:text-[#007B8A] transition-colors duration-300">
                    HOMME
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 px-2">Collection moderne et artisanale</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              className="relative group overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Link to="/femme" className="block">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img
                    src={collectionImage2}
                    alt="Collection Femme"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h3 className="mb-2 group-hover:text-[#007B8A] transition-colors duration-300">
                    FEMME
                  </h3>
                  <p className="text-sm text-gray-600">Prochainement</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              className="relative group overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Link to="/accessoires" className="block">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden" />
                <div className="mt-4 text-center">
                  <h3 className="mb-2 group-hover:text-[#007B8A] transition-colors duration-300">
                    ACCESSOIRES
                  </h3>
                  <p className="text-sm text-gray-600">Sacs et ceintures artisanaux</p>
                </div>
              </Link>
            </motion.div>

            <motion.div
              className="relative group overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Link to="/nouveautes" className="block">
                <div className="aspect-[3/4] bg-gray-100 overflow-hidden" />
                <div className="mt-4 text-center">
                  <h3 className="mb-2 group-hover:text-[#007B8A] transition-colors duration-300">
                    NOUVEAUTÉS
                  </h3>
                  <p className="text-sm text-gray-600">Dernières créations</p>
                </div>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Editorial Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-[4/5] bg-gray-200 overflow-hidden">
                <img
                  src={editorialImage}
                  alt="Editorial"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 sm:mb-6">PORTEZ LE CHANGEMENT</h2>
              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Chaque pièce CM CLASS incarne l'excellence de l'artisanat congolais et c��lèbre l'identité contemporaine de Goma. 
                Nous créons des vêtements intemporels qui transcendent les modes passagères, en privilégiant la qualité, 
                la durabilité et le respect de nos artisans.
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-10 leading-relaxed">
                Notre approche minimaliste met en lumière la beauté des matériaux nobles et des finitions soignées, 
                offrant une élégance discrète pour l'homme moderne qui valorise l'authenticité et le savoir-faire.
              </p>
              <Link
                to="/a-propos"
                className="inline-block border border-black px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-sm sm:text-base hover:bg-black hover:text-white transition-all duration-300"
              >
                NOTRE VISION
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Men's Products Grid */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-32">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            className="text-center mb-8 sm:mb-12 md:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="mb-3 sm:mb-4">COLLECTION HOMME</h2>
            <p className="text-sm sm:text-base text-gray-600 px-4">Pièces essentielles pour l'homme contemporain</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {featuredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>

          <motion.div
            className="text-center mt-8 sm:mt-10 md:mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              to="/homme"
              className="inline-block bg-[#007B8A] text-white px-6 sm:px-8 md:px-12 py-3 sm:py-4 text-sm sm:text-base hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              VOIR TOUTE LA COLLECTION
            </Link>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section className="relative py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${atelierImage})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.div
            className="max-w-2xl text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-white mb-4 sm:mb-6">L'ATELIER DE GOMA</h2>
            <p className="text-white/90 mb-6 sm:mb-8 leading-relaxed text-base sm:text-lg">
              Au cœur de Goma, nos artisans perpétuent des techniques ancestrales pour créer des pièces d'exception. 
              Chaque vêtement est le fruit d'un savoir-faire minutieux et d'une passion pour l'excellence.
            </p>
            <Link
              to="/a-propos"
              className="inline-block border-2 border-white text-white px-6 sm:px-8 md:px-10 py-3 sm:py-4 text-sm sm:text-base hover:bg-white hover:text-black transition-all duration-300"
            >
              DÉCOUVRIR NOTRE HISTOIRE
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal
            product={quickViewProduct}
            onClose={() => setQuickViewProduct(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
