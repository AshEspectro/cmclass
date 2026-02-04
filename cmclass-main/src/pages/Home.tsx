import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Hero } from '../components/Hero';
import { ProductCard, type ApiProduct } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
//import { Newsletter } from '../components/Newsletter';
import { CategoryHero } from '../components/CollectionHero';
import { Services } from '../components/ServiceSection';
import { useCategories } from '../hooks/useCategories';
import { publicApi } from '../services/publicApi';



//const atelierImage =
 // 'https://images.unsplash.com/photo-1704729105381-f579cfcefd63?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYXNoaW9uJTIwYXRlbGllciUyMHdvcmtzcGFjZSUyMG1pbmltYWx8ZW58MXx8fHwxNzYyMjU1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080';
//const editorialImage =
 // 'https://images.unsplash.com/photo-1698444056939-ba73e533d006?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZnJpY2FuJTIwbWFuJTIwZm9ybWFsJTIwd2VhciUyMHN0dWRpb3xlbnwxfHx8fDE3NjIyNTU3NDV8MA&ixlib=rb-4.1.0&q=80&w=1080';


interface CampaignSection {
  categoryTitle: string;
  categoryId?: number;
  campaignId?: number;
  link: string;
  buttonText?: string;
  campaign: Record<string, unknown>;
  products: ApiProduct[];
}

export const Home = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<ApiProduct | null>(null);
  const { leafCategories, loading: categoriesLoading } = useCategories();
  const [campaignSections, setCampaignSections] = useState<CampaignSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [servicesData, setServicesData] = useState<{ image: string; title: string; description: string; link: string }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch campaigns
        const campaigns = await publicApi.getCampaigns();
        
        // Build campaign sections - only use campaigns with status "Actif" (French for Active)
        const activeCampaigns = Array.isArray(campaigns) 
          ? campaigns.filter((c: Record<string, unknown>) => c.status === 'Actif') 
          : [];
        
        // Fetch products for each campaign
        const sections: CampaignSection[] = await Promise.all(
          activeCampaigns.map(async (campaign: Record<string, unknown>) => {
            const campaignId = campaign.id as number;
            const campaignProducts = await publicApi.getCampaignCatalog(campaignId);
            const products: ApiProduct[] = Array.isArray(campaignProducts) ? campaignProducts : campaignProducts.items || [];
            
            return {
              categoryTitle: (campaign.title as string) || '',
              categoryId: campaign.categoryId as number,
              campaignId: campaignId,
              link: (campaign.link as string) || '/homme',
              buttonText: (campaign.buttonText as string) || 'Découvrir la collection',
              campaign: campaign,
              products: products,
            };
          })
        );
        
        setCampaignSections(sections);
        // fetch services for the services section
        try {
          const s = await publicApi.getServices();
          const items = Array.isArray(s)
            ? s.map((svc: any) => ({ image: svc.imageUrl || '', title: svc.title || '', description: svc.description || '', link: svc.link || '/' }))
            : [];
          setServicesData(items);
        } catch (e) {
          console.error('Error loading services:', e);
          setServicesData([]);
        }
      } catch (error) {
        console.error('Error fetching campaign data:', error);
        setCampaignSections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section - uses data from API */}
      <Hero />


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
            Explorer une sélection de créations de la marque
          </motion.h3>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {categoriesLoading ? (
              <div className="col-span-full text-center py-8">Chargement des collections...</div>
            ) : leafCategories.length === 0 ? (
              <div className="col-span-full text-center py-8">Aucune collection disponible</div>
            ) : (
              leafCategories.slice(0, 8).map((cat, i) => (
                <motion.div
                  key={`${cat.slug}-${i}`}
                  className="relative group overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                >
                  <Link to={`/${cat.slug}`} className="block">
                    <div className="aspect-4/5 bg-gray-100 overflow-hidden">
                      {cat.imageUrl && (
                        <img
                          src={cat.imageUrl}
                          alt={cat.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                    </div>
                    <div className="my-4 sm:mt-4 text-center">
                      <p className="text-lg sm:text-sm text-black lg:font-bold group-hover:text-[#007B8A] transition-colors duration-300">{cat.slug}</p>
                    </div>
                  </Link>
                </motion.div>
              ))
            )}
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
      
 
{/* Campaign Sections - Dynamically Rendered */}
{campaignSections.length > 0 ? (
  campaignSections.map((section, index) => (
    <section key={`campaign-${index}`} className='mb-32'>
      <CategoryHero categoryTitle={section.categoryTitle} campaignId={section.campaignId} />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-4 md:gap-5 lg:gap-8">
          {section.products.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
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
            to={section.link}
            className="inline-block border hover:border-2 font-medium text-black px-6 sm:px-8 md:px-8 py-3 sm:py-4 lg:py-3 text-sm sm:text-base transition-all duration-300 rounded-4xl"
          >
            {section.buttonText}
          </Link>
        </motion.div>
      </div>
    </section>
  ))
) : (
  <section className='mb-32'>
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-12 text-center">
      {loading ? (
        <p className="text-gray-600">Chargement des campagnes...</p>
      ) : (
        <p className="text-gray-600">Aucune campagne active disponible</p>
      )}
    </div>
  </section>
)}



{/* Service section */}
      <Services
        title="les services CMClass"
        description="La marque CMClass offre une mode sur mesure, avec pièces exclusives et services personnalisés.\nChaque vêtement reflète l’excellence artisanale et un style contemporain affirmé.."
        items={servicesData.length ? servicesData : [
          {
            image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80",
            title: "Sur mesure",
            description: "explorer",
            link: "/homme",
          },
          {
            image: "https://images.unsplash.com/photo-1520975918311-7ce9d52f67e4?auto=format&fit=crop&w=800&q=80",
            title: "Selection exclusive",
            description: "Pièces choisis pour vous",
            link: "/homme/pantalons",
          },
          {
            image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80",
            title: "Services",
            description: "Nous contacter",
            link: "/pages/Contact",
          },
        ]}
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
