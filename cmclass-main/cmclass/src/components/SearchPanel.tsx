import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { publicApi } from '../services/publicApi';
import type { Product_cat } from '../types/api';

interface SearchPanelProps {
  onClose: () => void;
}

export const SearchPanel = ({ onClose }: SearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product_cat[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch products when panel opens
    const fetchProducts = async () => {
      setLoading(true);
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
        setProducts(mapped);
      } catch (error) {
        console.error('Failed to fetch products for search:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = searchQuery.trim()
    ? products.filter(product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.label && product.label.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    : [];

  const suggestedSearches = [
    'Chemises Homme',
    'Costumes',
    'Vestes',
    'Pantalons',
    'Accessoires'
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel - Desktop: Left Side Slide-in */}
      <motion.div
        className="fixed top-0 left-0 bottom-0 w-full sm:w-[400px] md:w-[500px] bg-white z-50 overflow-y-auto"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl tracking-wider">RECHERCHER</h3>
            <button
              onClick={onClose}
              className="hover:text-[#007B8A] transition-colors duration-300"
              aria-label="Fermer"
            >
              <X size={24} />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-8">
            <input
              type="text"
              placeholder="Que cherchez-vous ?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-b-2 border-black py-3 pr-10 text-sm sm:text-base focus:outline-none focus:border-[#007B8A] transition-colors duration-300"
              autoFocus
            />
            <Search className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          {/* Suggested Searches - Show when no query */}
          {!searchQuery.trim() && (
            <div className="mb-8">
              <p className="text-xs text-gray-600 mb-4 tracking-wide">SUGGESTIONS</p>
              <div className="space-y-3">
                {suggestedSearches.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setSearchQuery(suggestion)}
                    className="block text-sm text-gray-700 hover:text-[#007B8A] transition-colors duration-300"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && searchQuery.trim() && (
            <div className="text-center py-8">
              <p className="text-gray-600">Recherche en cours...</p>
            </div>
          )}

          {/* Results */}
          {searchQuery.trim() && !loading && (
            <div>
              <p className="text-xs text-gray-600 mb-4 tracking-wide">
                {filteredProducts.length} RÉSULTAT{filteredProducts.length !== 1 ? 'S' : ''}
              </p>
              <div className="space-y-4">
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={`/product/${product.id}`}
                      onClick={onClose}
                      className="flex gap-4 hover:bg-gray-50 p-2 -mx-2 transition-colors duration-300 group"
                    >
                      <div className="w-20 h-20 bg-gray-100 flex-shrink-0 overflow-hidden">
                        {product.productImage && (
                          <img src={product.productImage} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm mb-1 truncate group-hover:text-[#007B8A] transition-colors duration-300">
                          {product.name}
                        </h4>
                        {product.label && <p className="text-xs text-gray-600 mb-1">{product.label}</p>}
                        <p className="text-sm">{product.price}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {searchQuery.trim() && !loading && filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Aucun produit trouvé</p>
              <p className="text-sm text-gray-500">
                Essayez avec d'autres mots-clés
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
};
