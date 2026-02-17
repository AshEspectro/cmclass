/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Skeleton, SkeletonProductCard, SkeletonCategoryItem } from '../components/Skeleton';
import { parsePriceValue } from '../utils/currency';

const RETRY_DELAY_MS = 3000;


export const Home = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product_cat | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [exploreCategories, setExploreCategories] = useState<any[]>([]);
  const [servicesHeader, setServicesHeader] = useState({ title: 'les services CMClass', description: "La marque CMClass offre une mode sur mesure, avec pièces exclusives et services personnalisés.\nChaque vêtement reflète l’excellence artisanale et un style contemporain affirmé.." });
  const [servicesItems, setServicesItems] = useState<any[]>([]);
  const [productsData, setProductsData] = useState<Product_cat[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [campaignsLoading, setCampaignsLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [servicesLoading, setServicesLoading] = useState(true);

  const isPageLoading =
    campaignsLoading || categoriesLoading || productsLoading || servicesLoading;

  const isCampaignActive = (status?: string) => {
    if (!status) return true;
    const normalized = status.trim().toLowerCase();
    return ['actif', 'active', 'published', 'publie', 'publiee', 'public'].includes(normalized);
  };

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | undefined;

    const fetchData = async () => {
      if (cancelled) return;
      try {
        setCampaignsLoading(true);
        setCategoriesLoading(true);
        const [campData, leafCategoriesData] = await Promise.all([
          campaignsApi.getCampaigns({ throwOnError: true }),
          publicApi.getLeafCategories({ throwOnError: true }),
        ]);
        if (cancelled) return;
        setCampaigns(campData);

        const leafCategories = Array.isArray(leafCategoriesData)
          ? leafCategoriesData
          : [];
        setExploreCategories(leafCategories.slice(0, 8)); // Show up to 8 leaf collections
        setCampaignsLoading(false);
        setCategoriesLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load initial data', err);
        setCampaignsLoading(false);
        setCategoriesLoading(false);
        retryTimer = window.setTimeout(fetchData, RETRY_DELAY_MS);
      }
    };
    fetchData();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | undefined;

    const fetchProducts = async () => {
      if (cancelled) return;
      setProductsLoading(true);
      try {
        const data = await publicApi.getProducts(1, 100, '', { throwOnError: true });
        if (cancelled) return;
        const items = Array.isArray(data) ? data : Array.isArray((data as any)?.items) ? (data as any).items : [];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mapped: Product_cat[] = (items || []).map((p: any) => ({
          id: Number(p.id),
          label: p.label || "",
          name: p.name || "",
          price:
            typeof p.price === "number"
              ? p.price
              : typeof p.price === "string"
              ? parsePriceValue(p.price)
              : typeof p.priceCents === "number"
              ? p.priceCents / 100
              : 0,
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
        setProductsLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Failed to load products', err);
        setProductsLoading(false);
        retryTimer = window.setTimeout(fetchProducts, RETRY_DELAY_MS);
      }
    };

    fetchProducts();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let retryTimer: number | undefined;

    const fetchServices = async () => {
      if (cancelled) return;
      setServicesLoading(true);
      try {
        const [brand, servicesData] = await Promise.all([
          publicApi.getBrand({ throwOnError: true }),
          publicApi.getServices({ throwOnError: true }),
        ]);
        if (cancelled) return;

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
        setServicesLoading(false);
      } catch (err) {
        if (cancelled) return;
        console.error('Error loading services', err);
        setServicesLoading(false);
        retryTimer = window.setTimeout(fetchServices, RETRY_DELAY_MS);
      }
    };

    fetchServices();

    return () => {
      cancelled = true;
      if (retryTimer) window.clearTimeout(retryTimer);
    };
  }, []); // Only fetch on mount

  // Use the latest campaign for the main Hero if available
  const activeCampaigns = campaigns.filter((campaign) => isCampaignActive(campaign.status));
  const latestCampaign = activeCampaigns.length > 0 ? activeCampaigns[0] : (campaigns.length > 0 ? campaigns[0] : null);
  const campaignsForSections = activeCampaigns;

  return (
    <div className="overflow-hidden">
      {isPageLoading ? (
        <Skeleton className="w-full aspect-video lg:aspect-[21/9]" />
      ) : (
        <Hero
          video={latestCampaign?.imageUrl}
          image={latestCampaign?.imageUrl}
          title={latestCampaign?.title}
          subtitle={latestCampaign?.genreText}
          ctaText={latestCampaign?.buttonText}
          ctaLink={latestCampaign ? `/category?campaign=${latestCampaign.id}` : "/category"}
        />
      )}

      {/* Explore Section */}
      <section className="py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <motion.h3
            className="text-center lg:px-20 mb-6 sm:mb-8 text-3xl font-regular  tracking-widest"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            Explorer une sélection de créations de la marque
          </motion.h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {isPageLoading
              ? Array.from({ length: 8 }).map((_, i) => <SkeletonCategoryItem key={i} />)
              : exploreCategories.map((cat, i) => (
                <motion.div
                  key={cat.id}
                  className="relative group overflow-hidden"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                >
                  <Link to={`/category?category=${cat.slug}`} className="block">
                    <div className="aspect-4/5 bg-gray-100 overflow-hidden ">
                      <img
                        src={cat.imageUrl || "/placeholder.jpg"}
                        alt={cat.title || cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                    <div className="my-4  text-center">
                      <p className="text-sm font-bold  tracking-widest group-hover:text-[#007B8A] transition-colors">
                        {cat.title || cat.name}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* Individual Campaigns */}
      {isPageLoading
        ? Array.from({ length: 2 }).map((_, i) => (
          <section key={i} className='mb-32'>
            <Skeleton className="w-full aspect-[21/9] mb-12" />
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {Array.from({ length: 4 }).map((_, j) => <SkeletonProductCard key={j} />)}
              </div>
            </div>
          </section>
        ))
        : campaignsForSections.map((campaign) => {
          const selectedIds = Array.isArray(campaign.selectedProductIds)
            ? new Set(
              campaign.selectedProductIds
                .map((id) => Number(id))
                .filter((id) => !Number.isNaN(id))
            )
            : new Set<number>();
          const campaignProducts = productsData.filter((p) => selectedIds.has(Number(p.id)));

          return (
            <section key={campaign.id} className='mb-32'>
              <CategoryHero
                campaignGenreText={campaign.genreText}
                campaignImage={campaign.imageUrl}
                campaignTitle={campaign.title}
              />

              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 mt-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                  {productsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => <SkeletonProductCard key={i} />)
                  ) : campaignProducts.length > 0 ? (
                    campaignProducts.slice(0, 4).map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onQuickView={(item) => setQuickViewProduct(item as Product_cat)}
                      />
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-400 italic">Aucune pièce sélectionnée pour cette exposition</p>
                  )}
                </div>

                <div className="text-center mt-12">
                  <Link
                    to={`/category?campaign=${campaign.id}`}
                    className="inline-block border border-black hover:border-2 font-medium px-10 py-4 text-sm transition-all duration-300 rounded-full tracking-widest"
                  >
                    {campaign.buttonText || 'Découvrir la collection'}
                  </Link>
                </div>
              </div>
            </section>
          );
        })}

      {isPageLoading ? (
        <section className="pb-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            <div className="text-center mb-8 sm:mb-12">
              <Skeleton className="h-8 w-72 mx-auto mb-3" />
              <Skeleton className="h-4 w-96 max-w-full mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="w-full aspect-[11/16] md:aspect-[3/4]" />
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <Services
          title={servicesHeader.title}
          description={servicesHeader.description}
          items={servicesItems}
        />
      )}

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
