import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Heart, ShoppingBag, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { products } from '../data/products';
import { useCart } from '../contexts/CartContext';
import type { CartItem } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import type { Product } from '../data/products';
import { useCurrency } from '../contexts/CurrencyContext';

export const ProductDetail = () => {
  const { id } = useParams();
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { formatPrice } = useCurrency();

  if (!product) {
    return (
      <div className="pt-20 sm:pt-24 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4">PRODUIT NON TROUVÉ</h2>
          <Link to="/homme" className="text-[#007B8A] hover:underline">
            Retour à la collection
          </Link>
        </div>
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      // Convert Product -> Partial<CartItem> to match addToCart signature
      const cartProduct: Partial<CartItem> = {
        id: product.id,
        name: product.name,
        price: product.price,
        label: (product as unknown as { label?: string }).label ?? undefined,
        productImage: product.image ?? product.images?.[0] ?? undefined,
        mannequinImage: product.images?.[1] ?? undefined,
        // Map string[] colors to expected { hex, images[] }[] shape
        colors: product.colors?.map((c) => ({ hex: String(c), images: [] })),
      };

      addToCart(cartProduct, selectedSize, selectedColor, quantity);
    }
  };

  const handleWishlistClick = () => {
    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="pt-20 sm:pt-24">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-3 sm:py-4">
          <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600">
            <Link to="/" className="hover:text-[#007B8A] transition-colors duration-300">
              Accueil
            </Link>
            <span>/</span>
            <Link to="/homme" className="hover:text-[#007B8A] transition-colors duration-300">
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-black">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-8 sm:py-10 md:py-12 lg:py-16">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16">
            {/* Images */}
            <div>
              <motion.div
                className="aspect-[3/4] bg-gray-100 mb-3 sm:mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
              />
              <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="aspect-square bg-gray-100 cursor-pointer hover:opacity-75 transition-opacity duration-300" />
                ))}
              </div>
            </div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="mb-3 sm:mb-4">{product.name}</h1>
              <p className="text-2xl sm:text-3xl mb-4 sm:mb-6">{formatPrice(product.price)}</p>

              <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">{product.description}</p>

              {/* Size Selection */}
              {product.sizes.length > 0 && (
                <div className="mb-5 sm:mb-6">
                  <label className="block text-xs sm:text-sm mb-2 sm:mb-3">TAILLE</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border transition-all duration-300 ${
                          selectedSize === size
                            ? 'border-[#007B8A] bg-[#007B8A] text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div className="mb-6 sm:mb-8">
                  <label className="block text-xs sm:text-sm mb-2 sm:mb-3">COULEUR</label>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 text-sm sm:text-base border transition-all duration-300 ${
                          selectedColor === color
                            ? 'border-[#007B8A] bg-[#007B8A] text-white'
                            : 'border-gray-300 hover:border-black'
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mb-6 sm:mb-8">
                <label className="block text-xs sm:text-sm mb-2 sm:mb-3">QUANTITÉ</label>
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 hover:border-black transition-colors duration-300 text-lg"
                  >
                    -
                  </button>
                  <span className="text-base sm:text-lg w-10 sm:w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 sm:w-12 sm:h-12 border border-gray-300 hover:border-black transition-colors duration-300 text-lg"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock || !selectedSize || !selectedColor}
                  className="flex-1 bg-[#007B8A] text-white py-3 sm:py-4 text-xs sm:text-sm md:text-base flex items-center justify-center gap-2 hover:bg-[#006170] transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <ShoppingBag size={18} className="sm:hidden" />
                  <ShoppingBag size={20} className="hidden sm:block" />
                  <span className="hidden sm:inline">{product.inStock ? 'AJOUTER AU PANIER' : 'ÉPUISÉ'}</span>
                  <span className="sm:hidden">{product.inStock ? 'AJOUTER' : 'ÉPUISÉ'}</span>
                </button>
                <button
                  onClick={handleWishlistClick}
                  className="w-12 sm:w-14 border border-gray-300 flex items-center justify-center hover:border-[#007B8A] hover:bg-[#007B8A] hover:text-white transition-all duration-300"
                  aria-label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                >
                  <Heart size={18} className="sm:hidden" fill={inWishlist ? 'currentColor' : 'none'} />
                  <Heart size={20} className="hidden sm:block" fill={inWishlist ? 'currentColor' : 'none'} />
                </button>
                <button
                  className="w-12 sm:w-14 border border-gray-300 flex items-center justify-center hover:border-black transition-colors duration-300"
                  aria-label="Partager"
                >
                  <Share2 size={18} className="sm:hidden" />
                  <Share2 size={20} className="hidden sm:block" />
                </button>
              </div>

              {!selectedSize || !selectedColor ? (
                <p className="text-xs sm:text-sm text-red-600 mb-4 sm:mb-6">Veuillez sélectionner une taille et une couleur</p>
              ) : null}

              {/* Additional Info */}
              <div className="border-t border-gray-200 pt-8 space-y-4 text-sm">
                <div>
                  <h4 className="mb-2">MATIÈRES</h4>
                  <p className="text-gray-600">Coton 100% naturel, tissé localement</p>
                </div>
                <div>
                  <h4 className="mb-2">ENTRETIEN</h4>
                  <p className="text-gray-600">Lavage à la main recommandé, séchage à plat</p>
                </div>
                <div>
                  <h4 className="mb-2">FABRICATION</h4>
                  <p className="text-gray-600">Fabriqué à la main à Goma, RD Congo</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-gray-50">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12">
            <h2 className="text-center mb-8 sm:mb-10 md:mb-12">VOUS AIMEREZ AUSSI</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8">
              {relatedProducts.map(relatedProduct => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          </div>
        </section>
      )}

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
