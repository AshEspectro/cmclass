import { useState } from 'react';
import { X, Heart, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product } from '../data/products';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Link } from 'react-router-dom';


interface QuickViewModalProps {
  product: Product;
  onClose: () => void;
}

export const QuickViewModal = ({ product, onClose }: QuickViewModalProps) => {
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || '');
  const [selectedColor, setSelectedColor] = useState(product.colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  void quantity;
void setQuantity;

  const handleAddToCart = () => {
    if (selectedSize && selectedColor) {
      addToCart({
        ...product,
        colors: [{ hex: selectedColor, images: [] }]
      }, selectedSize, selectedColor, quantity);
      onClose();
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
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          className="bg-white max-w-5xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10 w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#007B8A] hover:text-white transition-all duration-300 shadow-md"
              aria-label="Fermer"
            >
              <X size={18} className="sm:hidden" />
              <X size={20} className="hidden sm:block" />
            </button>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 p-4 sm:p-6 md:p-8 lg:p-12">
              {/* Image */}
              <div className="aspect-3/4 bg-gray-100" />

              {/* Details */}
              <div>
                <h2 className="mb-3 sm:mb-4 text-xl sm:text-2xl">{product.name}</h2>
                <p className="text-xl sm:text-2xl mb-4 sm:mb-6">{product.price.toLocaleString('fr-FR')} FC</p>

                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8 leading-relaxed">{product.description}</p>

                {/* Size Selection */}
                {product.sizes.length > 0 && (
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-xs sm:text-sm mb-2 sm:mb-3">TAILLE</label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size :string) => (
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
                      {product.colors.map((color: string) => (
                        <button
                          key={String(color)}
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

                {/* Actions */}
                <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
                  <button
                    onClick={handleAddToCart}
                    disabled={!product.inStock}
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
                </div>

                {/* View Full Details */}
                <Link
                  to={`/produit/${product.id}`}
                  onClick={onClose}
                  className="text-xs sm:text-sm text-gray-600 hover:text-[#007B8A] inline-block border-b border-gray-600 hover:border-[#007B8A] transition-colors duration-300"
                >
                  Voir tous les détails
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};
