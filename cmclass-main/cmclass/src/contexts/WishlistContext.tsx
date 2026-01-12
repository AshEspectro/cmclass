/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

// Unified type for wishlist items
export interface WishlistItem {
  id: string | number;
  name: string;
  price: string | number;
  label?: string;
  productImage?: string;       // main image
  mannequinImage?: string;     // hover image
  colors?: { hex: string; images: string[] }[] | string[]; // support both formats
  [key: string]: any;          // allow other properties from Product or Product_cat
}

interface WishlistContextType {
  items: WishlistItem[];
  addToWishlist: (product: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const addToWishlist = (product: WishlistItem) => {
    setItems((currentItems) => {
      if (currentItems.some((item) => item.id === product.id)) return currentItems;
      return [...currentItems, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id.toString() !== productId)
    );
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id.toString() === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ items, addToWishlist, removeFromWishlist, isInWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
};
