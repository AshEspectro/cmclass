import  { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { publicApi } from '../services/publicApi';
import type { ApiProduct } from './ProductCard';

interface SearchPanelProps {
  onClose: () => void;
}

export const SearchPanel = ({ onClose }: SearchPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q || q.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    setError(null);
    const handler = setTimeout(async () => {
      try {
        const data = await publicApi.getProducts(1, 12, q);
        const items: ApiProduct[] = Array.isArray(data)
          ? data
          : Array.isArray((data as any).data)
            ? (data as any).data
            : [];
        setResults(items);
      } catch (e: any) {
        if (!ctrl.signal.aborted) setError(e?.message || 'Erreur de recherche');
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      ctrl.abort();
      clearTimeout(handler);
    };
  }, [searchQuery]);

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

          {/* Results */}
          {searchQuery.trim() && (
            <div>
              <p className="text-xs text-gray-600 mb-4 tracking-wide">
                {loading ? 'Recherche...' : `${results.length} RESULTAT${results.length !== 1 ? 'S' : ''}`}
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="space-y-4">
                {results.map((product, index) => (
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
                        <p className="text-xs text-gray-600 mb-1">{(product as any).category || ''}</p>
                        <p className="text-sm">
                          {product.price
                            ? product.price.toLocaleString('fr-FR')
                            : product.priceCents
                            ? (product.priceCents / 100).toLocaleString('fr-FR')
                            : 0}{' '}
                          FC
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {searchQuery.trim() && !loading && results.length === 0 && (
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
