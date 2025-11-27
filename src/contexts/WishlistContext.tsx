import { createContext, useContext, useState } from 'react';
import type { Product_cat } from '../data/products';
import type { ReactNode } from 'react';

interface WishlistContextType {
  items: Product_cat[];
  addToWishlist: (product: Product_cat) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product_cat[]>([]);

  const addToWishlist = (product: Product_cat) => {
    setItems((currentItems) => {
      const exists = currentItems.some((item) => item.id === product.id);
      if (exists) return currentItems;
      return [...currentItems, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id.toString() !== productId));
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
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
