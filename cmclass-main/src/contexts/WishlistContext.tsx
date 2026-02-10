/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

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

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const getAuthToken = () => localStorage.getItem("auth_token");

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const { isAuthenticated } = useAuth();

  const syncWishlist = async () => {
    if (!isAuthenticated) return;
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to load wishlist");
      const json = await response.json();
      const data = (json?.data || []) as WishlistItem[];
      setItems(data);
    } catch (err) {
      console.error("Failed to sync wishlist:", err);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    let active = true;
    (async () => {
      if (!active) return;
      await syncWishlist();
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const addToWishlist = (product: WishlistItem) => {
    if (!isAuthenticated) return;
    const token = getAuthToken();
    if (!token) return;
    setItems((currentItems) => {
      if (currentItems.some((item) => item.id === product.id)) return currentItems;
      return [...currentItems, product];
    });

    fetch(`${API_BASE_URL}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productId: Number(product.id) }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add to wishlist");
        return res.json();
      })
      .then(() => syncWishlist())
      .catch((err) => {
        console.error("Wishlist add failed:", err);
        syncWishlist();
      });
  };

  const removeFromWishlist = (productId: string) => {
    if (!isAuthenticated) return;
    const token = getAuthToken();
    if (!token) return;
    setItems((currentItems) =>
      currentItems.filter((item) => item.id.toString() !== productId)
    );

    fetch(`${API_BASE_URL}/wishlist/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove from wishlist");
        return res.json().catch(() => null);
      })
      .then(() => syncWishlist())
      .catch((err) => {
        console.error("Wishlist remove failed:", err);
        syncWishlist();
      });
  };

  const isInWishlist = (productId: string) => {
    if (!isAuthenticated) return false;
    return items.some((item) => item.id.toString() === productId);
  };

  const visibleItems = isAuthenticated ? items : [];

  return (
    <WishlistContext.Provider
      value={{ items: visibleItems, addToWishlist, removeFromWishlist, isInWishlist }}
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
