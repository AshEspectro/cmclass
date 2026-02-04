import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { campaignsApi, type Campaign } from '../services/campaignsApi';
import type { Product as BackendProduct } from '../services/catalogApi';

interface CampaignWithProducts {
  campaign: Campaign;
  products: BackendProduct[];
}

export const CampaignPage = () => {
  const [campaignsWithProducts, setCampaignsWithProducts] = useState<CampaignWithProducts[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<BackendProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllCampaigns = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all campaigns
        const campaigns = await campaignsApi.getCampaigns();
        
        if (!campaigns || campaigns.length === 0) {
          setError('No campaigns available');
          return;
        }

        // Filter active campaigns
        const activeCampaigns = campaigns.filter(c => c.status === 'active');

        if (activeCampaigns.length === 0) {
          setError('No active campaigns');
          return;
        }

        // Fetch products for each campaign
        const campaignsData: CampaignWithProducts[] = [];
        
        for (const campaign of activeCampaigns) {
          try {
            const catalogData = await campaignsApi.getCampaignCatalog(campaign.id);
            if (catalogData) {
              campaignsData.push({
                campaign: catalogData.campaign,
                products: catalogData.products || [],
              });
            }
          } catch (err) {
            console.error(`Error fetching products for campaign ${campaign.id}:`, err);
          }
        }

        setCampaignsWithProducts(campaignsData);
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load campaigns');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllCampaigns();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Chargement des campagnes...</p>
        </div>
      </div>
    );
  }

  if (error || campaignsWithProducts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'No active campaigns available'}</p>
          <Link to="/" className="text-[#007B8A] hover:underline">
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <motion.div
        className="bg-gray-50 py-12 sm:py-16 md:py-20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2">
            Nos Campagnes Actives
          </h1>
          <p className="text-center text-gray-600">
            Découvrez nos collections exclusives et les meilleures créations de la saison
          </p>
        </div>
      </motion.div>

      {/* All Campaigns */}
      {campaignsWithProducts.map((item, campaignIndex) => (
        <section key={item.campaign.id} className="py-16 sm:py-20 md:py-24 border-b border-gray-100 last:border-b-0">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            {/* Campaign Hero Section */}
            {item.campaign.imageUrl && (
              <motion.div
                className="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg mb-12 sm:mb-16"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <img
                  src={item.campaign.imageUrl}
                  alt={item.campaign.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="text-center text-white">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
                      {item.campaign.title}
                    </h2>
                    {item.campaign.genreText && (
                      <p className="text-base sm:text-lg text-white/90">{item.campaign.genreText}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Campaign Title */}
            <motion.div
              className="mb-10 sm:mb-12 md:mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl sm:text-3xl font-bold mb-2">
                {item.campaign.title}
              </h3>
              {item.campaign.genreText && (
                <p className="text-gray-600">{item.campaign.genreText}</p>
              )}
            </motion.div>

            {/* Products Grid */}
            {item.products.length > 0 ? (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 mb-12 sm:mb-16"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, staggerChildren: 0.1 }}
              >
                {item.products.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.05 * index }}
                  >
                    <ProductCard
                      product={{
                        id: String(product.id),
                        name: product.name,
                        price: product.priceCents / 100,
                        category: 'COLLECTION',
                        subcategory: item.campaign.genreText || '',
                        image: product.productImage || '',
                        images: [],
                        description: product.description || '',
                        sizes: [],
                        colors: [],
                        inStock: product.inStock,
                      }}
                      onQuickView={setQuickViewProduct}
                    />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="text-center py-12 mb-12 sm:mb-16"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                <p className="text-gray-500 text-lg">Aucun produit disponible dans cette campagne</p>
              </motion.div>
            )}

            {/* Discover Collection Button */}
            {item.products.length > 0 && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Link
                  to={`/campaign/${item.campaign.id}`}
                  className="border-2 border-black px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-base font-medium hover:bg-black hover:text-white transition-all duration-300 rounded-full inline-block"
                >
                  {item.campaign.buttonText || 'Découvrir la collection'}
                </Link>
              </motion.div>
            )}
          </div>
        </section>
      ))}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
        />
      )}
    </div>
  );
};
