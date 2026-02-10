/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../services/secureApi";
import { useAuth } from "./AuthContext";

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
  loading: boolean;
  addToWishlist: (product: WishlistItem) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refresh: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const refresh = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await authFetch("/wishlist");
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      console.error("Failed to fetch wishlist", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addToWishlist = async (product: WishlistItem) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!product?.id) return;
    try {
      await authFetch("/wishlist", {
        method: "POST",
        body: JSON.stringify({ productId: Number(product.id) }),
      });
      await refresh();
    } catch (e) {
      console.error("Failed to add to wishlist", e);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await authFetch(`/wishlist/${productId}`, { method: "DELETE" });
      await refresh();
    } catch (e) {
      console.error("Failed to remove from wishlist", e);
    }
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item.id.toString() === productId);
  };

  return (
    <WishlistContext.Provider
      value={{ items, loading, addToWishlist, removeFromWishlist, isInWishlist, refresh }}
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
