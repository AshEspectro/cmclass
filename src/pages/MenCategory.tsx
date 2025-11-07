import  { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { products, type Product } from '../data/products';

const heroImage = 'https://images.unsplash.com/photo-1761522002366-870191e79f2a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxibGFjayUyMG1hbGUlMjBtb2RlbCUyMHdoaXRlJTIwYmFja2dyb3VuZCUyMGZhc2hpb258ZW58MXx8fHwxNzYyMjU1NzQ1fDA&ixlib=rb-4.1.0&q=80&w=1080';

export const MenCategory = () => {
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tous');
  const [sortBy, setSortBy] = useState<string>('Nouveautés');
  const [showFilters, setShowFilters] = useState(false);

  const menProducts = products.filter(p => p.category === 'HOMME');
  
  const subcategories = ['Tous', ...Array.from(new Set(menProducts.map(p => p.subcategory)))];

  const filteredProducts = selectedCategory === 'Tous'
    ? menProducts
    : menProducts.filter(p => p.subcategory === selectedCategory);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden mt-20 sm:mt-24">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-white mb-4">COLLECTION HOMME</h1>
            <p className="text-white/90 text-lg">Artisanat contemporain de Goma</p>
          </motion.div>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="border-b border-gray-200 sticky top-20 sm:top-24 bg-white z-10">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
          <div className="flex flex-col md:flex-row justify-between gap-3 sm:gap-4">
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {subcategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm border transition-all duration-300 ${
                    selectedCategory === cat
                      ? 'border-[#007B8A] bg-[#007B8A] text-white'
                      : 'border-gray-300 hover:border-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 border border-gray-300 px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 text-xs sm:text-sm hover:border-black transition-colors duration-300 w-full md:w-auto"
              >
                <span className="flex-1 md:flex-none text-left">Trier par: {sortBy}</span>
                <ChevronDown size={14} className="sm:hidden" />
                <ChevronDown size={16} className="hidden sm:block" />
              </button>

              {showFilters && (
                <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 shadow-lg w-full md:min-w-[200px] z-20">
                  {['Nouveautés', 'Prix croissant', 'Prix décroissant', 'A-Z'].map(option => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowFilters(false);
                      }}
                      className="block w-full text-left px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm hover:bg-gray-50 transition-colors duration-300"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 sm:mt-4">
            <p className="text-xs sm:text-sm text-gray-600">
              {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-600">Aucun produit trouvé dans cette catégorie</p>
            </div>
          )}
        </div>
      </section>

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
