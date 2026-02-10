import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Hero } from '../components/Hero';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import type { Product_cat } from '../types/api';
import { CategoryHero } from '../components/CollectionHero';
import { Services } from '../components/ServiceSection';
import { campaignsApi, type Campaign } from '../services/campaignsApi';
import { publicApi } from '../services/publicApi';

const heroVideo = '/videos/homme-hero1.mp4';
const collectionImage1 = 'https://images.unsplash.com/photo-1596216180471-61379344936c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbiUyMGZhc2hpb24lMjBtaW5pbWFsJTIwd2hpdGV8ZW58MXx8fHwxNzYyMjU1NzQ2fDA&ixlib=rb-4.1.0&q=80&w=1080';

export const Home = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product_cat | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [exploreCategories, setExploreCategories] = useState<any[]>([]);
  const [servicesHeader, setServicesHeader] = useState({ title: 'les services CMClass', description: "La marque CMClass offre une mode sur mesure, avec pièces exclusives et services personnalisés.\nChaque vêtement reflète l’excellence artisanale et un style contemporain affirmé.." });
  const [servicesItems, setServicesItems] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<Product_cat[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const campData = await campaignsApi.getCampaigns();
      setCampaigns(campData);

      const { mainCategories } = await publicApi.getCategories();
      setExploreCategories(mainCategories.slice(0, 8)); // Show up to 8 collections
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const data = await publicApi.getProducts();
        const mapped: Product_cat[] = (data || []).map((p: any) => ({
          id: Number(p.id),
          label: p.label || "",
          name: p.name || "",
          price: typeof p.price === "string" ? p.price : typeof p.price === "number" ? `${p.price.toFixed(2)}$` : "0.00$",
          longDescription: p.longDescription || p.description || "",
          productImage: p.productImage || (Array.isArray(p.images) ? p.images[0] : "") || "",
          mannequinImage: p.mannequinImage || (Array.isArray(p.images) ? p.images[1] : "") || p.productImage || "",
          colors: Array.isArray(p.colors)
            ? p.colors.map((c: any) =>
              typeof c === "string"
                ? { hex: c, images: [] }
                : { hex: c?.hex || "#000000", images: Array.isArray(c?.images) ? c.images : [] }
            )
            : [],
          sizes: Array.isArray(p.sizes) ? p.sizes : [],
        }));
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
        const servicesData = await publicApi.getServices();

        let localHeader: { title?: string; description?: string } | null = null;
        try {
          const raw = localStorage.getItem('cmclass_services_header');
          if (raw) localHeader = JSON.parse(raw);
        } catch (e) {
          console.warn('Failed to parse local services header', e);
        }

        const title = (localHeader && localHeader.title) || brand.servicesHeaderTitle || brand.slogan || brand.name || servicesHeader.title;
        const description = (localHeader && localHeader.description) || brand.servicesHeaderDescription || brand.description || servicesHeader.description;

        setServicesHeader({ title, description });

        const items = (servicesData || []).map((s: any) => ({
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
  }, []); // Only fetch on mount

  // Use the latest campaign for the main Hero if available
  const latestCampaign = campaigns.length > 0 ? campaigns[0] : null;

  return (
    <div className="overflow-hidden">
      <Hero
        video={heroVideo}
        image={latestCampaign?.imageUrl || collectionImage1}
        title={latestCampaign?.title || "COLLECTION AUTOMNE 2024"}
        subtitle={latestCampaign?.genreText || "Héritage & Modernité"}
        ctaText={latestCampaign?.buttonText || "DÉCOUVRIR"}
        ctaLink={latestCampaign ? `/category?campaign=${latestCampaign.id}` : "/category"}
      />

      {/* Explore Section */}
      <section className="py-8 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.h3
            className="text-center lg:px-60 mb-8 sm:mb-12 text-2xl font-light uppercase tracking-widest"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Explorer une sélection de créations de la marque
          </motion.h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {exploreCategories.map((cat, i) => (
              <motion.div
                key={cat.id}
                className="relative group overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
              >
                <Link to={`/category?category=${cat.slug}`} className="block">
                  <div className="aspect-4/5 bg-gray-100 overflow-hidden rounded-sm">
                    <img
                      src={cat.imageUrl || "/placeholder.jpg"}
                      alt={cat.title || cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm font-bold uppercase tracking-widest group-hover:text-[#007B8A] transition-colors">
                      {cat.title || cat.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{cat.description?.substring(0, 40)}...</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Individual Campaigns */}
      {campaigns.slice(1).map((campaign) => (
        <section key={campaign.id} className='mb-32'>
          <CategoryHero
            categoryTitle={campaign.genreText || 'Exclusivité'}
            campaignImage={campaign.imageUrl || collectionImage1}
            campaignTitle={campaign.title}
          />

          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 mt-12">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {productsLoading ? (
                <p className="col-span-full text-center text-gray-500">Chargement...</p>
              ) : productsData.filter(p => campaign.selectedProductIds?.includes(Number(p.id))).length > 0 ? (
                productsData.filter(p => campaign.selectedProductIds?.includes(Number(p.id))).slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} onQuickView={setQuickViewProduct} />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-400 italic">Aucune pièce sélectionnée pour cette exposition</p>
              )}
            </div>

            <div className="text-center mt-12">
              <Link
                to={`/category?campaign=${campaign.title}`}
                className="inline-block border border-black hover:bg-black hover:text-white font-medium px-10 py-3 text-sm transition-all duration-300 rounded-full uppercase tracking-widest"
              >
                {campaign.buttonText || 'Découvrir la collection'}
              </Link>
            </div>
          </div>
        </section>
      ))}

      <Services
        title={servicesHeader.title}
        description={servicesHeader.description}
        items={servicesItems}
      />

      <AnimatePresence>
        {quickViewProduct && <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />}
      </AnimatePresence>
    </div>
  );
};
