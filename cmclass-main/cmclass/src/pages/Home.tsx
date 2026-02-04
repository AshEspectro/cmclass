import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
//import { Newsletter } from '../components/Newsletter';
import type { Product } from '../data/products';
import { CategoryHero } from '../components/CollectionHero';
import { Services } from '../components/ServiceSection';
import { campaignsApi, type Campaign } from '../services/campaignsApi';
import { publicApi } from '../services/publicApi';

// Video for hero (Pexels free download)
const heroVideo = '/videos/homme-hero1.mp4';

//const atelierImage =
 // 'https://images.unsplash.com/photo-1704729105381-f579cfcefd63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYXRlbGllciUyMHdvcmtzcGFjZSUyMG1pbmltYWx8ZW58MXx8fHwxNzYyMjU1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080';
//const editorialImage =
 // 'https://images.unsplash.com/photo-1698444056939-ba73e533d006?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFuJTIwZm9ybWFsJTIwd2VhciUyMHN0dWRpb3xlbnwxfHx8fDE3NjIyNTU3NDV8MA&ixlib=rb-4.1.0&q=80&w=1080';
const collectionImage1 =
  'https://images.unsplash.com/photo-1596216180471-61379344936c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbiUyMGZhc2hpb24lMjBtaW5pbWFsJTIwd2hpdGV8ZW58MXx8fHwxNzYyMjU1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080';
const collectionImage2 =
  'https://images.unsplash.com/photo-1617724757497-79b54c5444d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1vZGVsJTIwY2FzdWFsJTIwd2VhcnxlbnwxfHx8fDE3NjIyNTU3NDh8MA&ixlib=rb-4.1.0&q=80&w=1080';



export const Home = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [servicesHeader, setServicesHeader] = useState({ title: 'les services CMClass', description: "La marque CMClass offre une mode sur mesure, avec pièces exclusives et services personnalisés.\nChaque vêtement reflète l’excellence artisanale et un style contemporain affirmé.." });
  const [servicesItems, setServicesItems] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      const data = await campaignsApi.getCampaigns();
      setCampaigns(data);
    };
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const data = await publicApi.getProducts();
        const mapped: Product[] = (data || []).map((p: any) => {
          const numericPrice = Number(String(p.price ?? 0).replace(/[^0-9.-]+/g, ""));
          return {
            id: String(p.id),
            name: p.name || '',
            price: Number.isFinite(numericPrice) ? numericPrice : 0,
            category: p.category || 'COLLECTION',
            subcategory: '',
            image: p.productImage || p.images?.[0] || '',
            images: Array.isArray(p.images) ? p.images : [],
            description: p.description || p.longDescription || '',
            sizes: Array.isArray(p.sizes) ? p.sizes : [],
            colors: Array.isArray(p.colors)
              ? p.colors
                  .map((c: any) => (typeof c === 'string' ? c : c?.hex))
                  .filter(Boolean)
              : [],
            inStock: p.inStock !== false,
          };
        });
        setProductsData(mapped);
      } catch (err) {
        console.error('Failed to load products', err);
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const brand = await publicApi.getBrand();
        const services = await publicApi.getServices();

        // Check for local override saved by Content Manager (localStorage)
        let localHeader: { title?: string; description?: string } | null = null;
        try {
          const raw = localStorage.getItem('cmclass_services_header');
          if (raw) localHeader = JSON.parse(raw);
        } catch (e) {
          console.warn('Failed to parse local services header', e);
        }

        // Use local header when available, otherwise prefer persisted brand service header, then fall back
        const title = (localHeader && localHeader.title) || brand.servicesHeaderTitle || brand.slogan || brand.name || servicesHeader.title;
        const description = (localHeader && localHeader.description) || brand.servicesHeaderDescription || brand.description || servicesHeader.description;

        setServicesHeader({ title, description });

        // Map services to items shape expected by Services component
        const items = (services || []).map((s: any) => ({
          image: s.imageUrl,
          title: s.title,
          description: s.description,
          link: s.link || '#',
        }));
        setServicesItems(items);
      } catch (err) {
        console.error('Error loading services', err);
      }
    };

    fetchServices();

    // Listen for admin-saved updates in same window
    const onHeaderUpdated = () => fetchServices();
    window.addEventListener('cmclass_services_header_updated', onHeaderUpdated);

    // Also listen for storage events (other tabs) when ContentManager writes to localStorage
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cmclass_services_header') fetchServices();
    };
    window.addEventListener('storage', onStorage);

    return () => {
      window.removeEventListener('cmclass_services_header_updated', onHeaderUpdated);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section with video */}
      <Hero
        
        video={heroVideo}           // desktop video
        image={collectionImage1}    // fallback image for mobile
        title="COLLECTION AUTOMNE 2024"
        subtitle= "Homme"
       ctaText="DÉCOUVRIR"
       ctaLink="/homme"
      />
<div className='text-xxl'>Lalala</div>

      {/* Featured Collections*/}
      <section className="  py-8 lg:py-8 ">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.h3
            className="text-center  lg:px-60 mb-4 sm:mb-8 md:mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Explorer une sélection de lolo khklhioiioioiopcréations de la marque
          </motion.h3>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {[{ img: collectionImage1, title: 'HOMME', desc: 'Collection moderne et artisanale', link: '/homme' },
              { img: collectionImage2, title: 'FEMME', desc: 'Prochainement', link: '/femme' },
              { img: '', title: 'ACCESSOIRES', desc: 'Sacs et ceintures artisanaux', link: '/accessoires' },
              { img: '', title: 'NOUVEAUTÉS', desc: 'Dernières créations', link: '/nouveautes' },
            { img: collectionImage1, title: 'HOMME', desc: 'Collection moderne et artisanale', link: '/homme' },
              { img: collectionImage2, title: 'FEMME', desc: 'Prochainement', link: '/femme' },
              { img: '', title: 'ACCESSOIRES', desc: 'Sacs et ceintures artisanaux', link: '/accessoires' },
              { img: '', title: 'NOUVEAUTÉS', desc: 'Dernières créations', link: '/nouveautes' }
            ].map((col, i) => (
              <motion.div
                key={col.title}
                className="relative group overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <Link to={col.link} className="block">
                  <div className="aspect-4/5 bg-gray-100 overflow-hidden">
                    {col.img && (
                      <img
                        src={col.img}
                        alt={col.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                  <div className="my-4 sm:mt-4 text-center">
                    
                    <p className="text-lg sm:text-sm text-black lg:font-bold group-hover:text-[#007B8A] transition-colors duration-300">{col.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    

      {/* Editorial Section 
      <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gray-50">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="aspect-4/5 bg-gray-200 overflow-hidden">
                <img src={editorialImage} alt="Editorial" className="w-full h-full object-cover" />
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
                Chaque pièce CM CLASS incarne l'excellence de l'artisanat congolais et célèbre l'identité contemporaine de Goma.
                Nous créons des vêtements intemporels qui transcendent les modes passagères, en privilégiant la qualité, la durabilité et le respect de nos artisans.
              </p>
              <p className="text-sm sm:text-base text-gray-600 mb-8 sm:mb-10 leading-relaxed">
                Notre approche minimaliste met en lumière la beauté des matériaux nobles et des finitions soignées, offrant une élégance discrète pour l'homme moderne qui valorise l'authenticité et le savoir-faire.
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
        Men's Products Grid */}
      
 
 
 {/*Campaigns section*/}
      {campaigns.map((campaign) => {
        // Get products for this campaign
        const campaignProducts = productsData.filter((p) => 
          campaign.selectedProductIds?.includes(Number(p.id))
        ).slice(0, 4);

        return (
          <section key={campaign.id} className='mb-32'>
            <CategoryHero categoryTitle={campaign.genreText || 'Campagne'} subCategoryIndex={0} />

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 lg:gap-8">
                {productsLoading ? (
                  <p className="col-span-full text-center text-gray-500">Chargement des produits...</p>
                ) : campaignProducts.length > 0 ? (
                  campaignProducts.map((product) => (
                    <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500">Aucun produit sélectionné pour cette campagne</p>
                )}
              </div>

              <motion.div
                className="text-center mt-8 sm:mt-10 md:mt-12"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link
                  to={`/category?campaign=${campaign.id}`}
                  className="inline-block border hover:border-2 font-medium text-black px-6 sm:px-8 md:px-8 py-3 sm:py-4 lg:py-3 text-sm sm:text-base transition-all duration-300 rounded-4xl"
                >
                  {campaign.buttonText || 'Découvrir la collection'}
                </Link>
              </motion.div>
            </div>
          </section>
        );
      })}
      


      {/* Services Section */}
      <Services
        title={servicesHeader.title}
        description={servicesHeader.description}
        items={servicesItems}
      />


      {/* About Section 
      <section className="relative py-20 sm:py-24 md:py-32 lg:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${atelierImage})` }}>
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
      </section>*/}

      {/* Newsletter 
      <Newsletter />*/}

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
      </AnimatePresence>
    </div>
  );
};
