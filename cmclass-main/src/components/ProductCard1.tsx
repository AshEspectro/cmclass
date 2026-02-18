import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { useWishlist } from '../contexts/WishlistContext';
import { useCurrency } from '../contexts/CurrencyContext';

const normalizeAssetUrl = (url?: string | null) => {
  if (!url) return '';
  const doubleHttpMatch = url.match(/^(https?:\/\/[^/]+)(https?:\/\/.*)$/);
  if (doubleHttpMatch) return doubleHttpMatch[2];
  return url;
};

export interface ApiProduct {
  id: number | string;
  name: string;
  price?: number | string;
  priceCents?: number;
  productImage?: string;
  mannequinImage?: string;
  label?: string;
  description?: string;
  longDescription?: string | null;
  colors?: Array<{ name?: string; hex: string; images?: string[] }> | string[];
  sizes?: string[];
  stock?: number;
  inStock?: boolean;
  categoryId?: number;
  images?: string[];
}

interface ProductCardProps {
  product: ApiProduct;
  onQuickView?: (product: ApiProduct) => void;
}

export const ProductCard = ({ product }: ProductCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { formatPrice } = useCurrency();
  const inWishlist = isInWishlist(String(product.id));
  const imageSrc = normalizeAssetUrl(
    product.productImage || (Array.isArray(product.images) ? product.images[0] : undefined)
  );
  const priceValue =
    product.price ?? (typeof product.priceCents === 'number' ? product.priceCents / 100 : 0);
  const productDescription = product.description;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(String(product.id));
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
        <div className="aspect-[3/4] bg-gray-100 relative">
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
            className="absolute top-[0.2px] right-0.5 w-8 h-8  flex items-center justify-center hover:text-white transition-all duration-300 z-10"
            aria-label={inWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Heart
              size={18}
              fill={inWishlist ? 'currentColor' : 'none'}
              className={inWishlist ? 'text-[#007B8A]' : '' }
            />
          </button>

          {/* Out of Stock Badge*/}
          {!product.inStock && (
            <div className="absolute top-2 left-2  text-black  text-xs">
              ÉPUISÉ
            </div>
          )} 
        </div>

        {/* Product Info */}
        <div className="mt-4">
  <p className="text-[#007B8A] text-[0.8rem] md:text-sm tracking-widest mb-1">{product.name}</p>
  {productDescription ? (
    <p className="text-[0.78rem] md:text-sm tracking-wider mb-1">{productDescription}</p>
  ) : null}
  <p className="text-[0.9rem] md:block">{formatPrice(priceValue)}</p>
</div>

      </Link>
    </motion.div>
  );
};
