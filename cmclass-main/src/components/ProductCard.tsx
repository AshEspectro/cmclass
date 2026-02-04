import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useWishlist } from '../contexts/WishlistContext';

const normalizeAssetUrl = (url?: string | null) => {
  if (!url) return '';
  const doubleHttpMatch = url.match(/^(https?:\/\/[^/]+)(https?:\/\/.*)$/);
  if (doubleHttpMatch) return doubleHttpMatch[2];
  return url;
};

export interface ApiProduct {
  id: number | string;
  name: string;
  price?: number;
  priceCents?: number;
  productImage?: string;
  mannequinImage?: string;
  label?: string;
  description?: string;
  colors?: Array<{ name: string; hex: string; images?: string[] }> | string[];
  sizes?: string[];
  stock?: number;
  inStock?: boolean;
  categoryId?: number;
  images?: string[];
  [key: string]: unknown;
}

interface ProductCardProps {
  product: ApiProduct;
  onQuickView?: (product: ApiProduct) => void;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id as string | number);
  const imageSrc = normalizeAssetUrl(
    product.productImage || (Array.isArray(product.images) ? product.images[0] : undefined)
  );

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(product.id as string | number);
    } else {
      addToWishlist(product as any);
    }
  };

  return (
    <motion.div
      className="group relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
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
          {!product.inStock && (
            <div className="absolute top-4 left-4 bg-black text-white px-3 py-1 text-xs">
              ÉPUISÉ
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="mt-4">
  <p className="text-sm font-medium">{product.name}</p>
  <p className="hidden text-cyan-700 text-sm md:block">{((product.price || product.priceCents) ? (product.price || (product.priceCents as number) / 100) : 0).toLocaleString('fr-FR')} FC</p>
</div>

      </Link>
    </motion.div>
  );
};
