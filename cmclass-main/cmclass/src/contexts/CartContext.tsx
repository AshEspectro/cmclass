/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "../services/secureApi";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string | number;
  name: string;
  price: number;
  label?: string;
  productImage?: string;
  mannequinImage?: string;
  colors?: { hex: string; images: string[] }[];
  quantity: number;
  selectedSize: string;
  selectedColor: string;
  [key: string]: unknown; // allow extra props
}

interface CartContextType {
  items: CartItem[];
  loading: boolean;
  addToCart: (product: Partial<CartItem>, size: string, color: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string | number, size: string, color: string) => Promise<void>;
  updateQuantity: (productId: string | number, size: string, color: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
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
      const data = await authFetch("/cart");
      setItems(Array.isArray(data?.data) ? data.data : []);
    } catch (e) {
      console.error("Failed to fetch cart", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addToCart = async (product: Partial<CartItem>, size: string, color: string, quantity: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!product?.id) return;
    try {
      await authFetch("/cart/items", {
        method: "POST",
        body: JSON.stringify({
          productId: Number(product.id),
          quantity,
          selectedSize: size,
          selectedColor: color,
        }),
      });
      await refresh();
    } catch (e) {
      console.error("Failed to add to cart", e);
    }
  };

  const removeFromCart = async (productId: string | number, size: string, color: string) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await authFetch("/cart/items", {
        method: "DELETE",
        body: JSON.stringify({
          productId: Number(productId),
          selectedSize: size,
          selectedColor: color,
        }),
      });
      await refresh();
    } catch (e) {
      console.error("Failed to remove from cart", e);
    }
  };

  const updateQuantity = async (productId: string | number, size: string, color: string, quantity: number) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await authFetch("/cart/items", {
        method: "PATCH",
        body: JSON.stringify({
          productId: Number(productId),
          quantity,
          selectedSize: size,
          selectedColor: color,
        }),
      });
      await refresh();
    } catch (e) {
      console.error("Failed to update cart quantity", e);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await authFetch("/cart", { method: "DELETE" });
      setItems([]);
    } catch (e) {
      console.error("Failed to clear cart", e);
    }
  };

  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, loading, addToCart, removeFromCart, updateQuantity, clearCart, refresh, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
