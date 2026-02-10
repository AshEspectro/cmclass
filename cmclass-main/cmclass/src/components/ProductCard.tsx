import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye } from 'lucide-react';
import { motion } from 'motion/react';
import type { Product_cat } from '../types/api';
import { useWishlist } from '../contexts/WishlistContext';

const normalizeAssetUrl = (url?: string | null) => {
  if (!url) return '';
  const doubleHttpMatch = url.match(/^(https?:\/\/[^/]+)(https?:\/\/.*)$/);
  if (doubleHttpMatch) return doubleHttpMatch[2];
  return url;
};

interface ProductCardProps {
  product: Product_cat;
  onQuickView: (product: Product_cat) => void;
}

export const ProductCard = ({ product, onQuickView }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const productIdStr = product.id.toString();
  const inWishlist = isInWishlist(productIdStr);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(productIdStr);
    } else {
      addToWishlist(product as any);
    }
  };

  const imageSrc = normalizeAssetUrl(
    product.productImage || (product.colors && product.colors[0]?.images[0]) || ''
  );

  // Fallback for inStock since it might not be in Product_cat yet, assume true if undefined
  const inStock = true;

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden">
        {/* Image */}
        <div className="aspect-3/4 bg-gray-100 relative">
          {imageSrc && (
            <img
              src={imageSrc}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          )}
          {/* Hover Overlay */}
          <motion.div
            className="absolute inset-0 bg-[#007B8A]/20 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                onQuickView(product);
              }}
              className="bg-white text-black px-6 py-3 flex items-center gap-2 hover:bg-[#007B8A] hover:text-white transition-all duration-300 hover:scale-105"
            >
              <Eye size={18} />
              <span className="text-sm">APERÇU RAPIDE</span>
            </button>
          </motion.div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-[#007B8A] hover:text-white transition-all duration-300 z-10"
            aria-label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart
              size={18}
              fill={inWishlist ? 'currentColor' : 'none'}
              className={inWishlist ? 'text-[#007B8A]' : ''}
            />
          </button>

          {/* Out of Stock Badge */}
          {!inStock && (
            <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs">
              ÉPUISÉ
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mt-4">
          <p className="text-sm font-medium">{product.name}</p>
          <p className="hidden text-cyan-700 text-sm md:block">{product.price}</p>
        </div>
      </Link>
    </motion.div>
  );
};
