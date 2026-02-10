/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: string | number;
  productId?: number;
  cartItemId?: number;
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
  addToCart: (product: Partial<CartItem>, size: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string | number, size: string, color: string) => void;
  updateQuantity: (productId: string | number, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const getAuthToken = () => localStorage.getItem("auth_token");

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { isAuthenticated } = useAuth();

  const syncCart = async () => {
    if (!isAuthenticated) return;
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to load cart");
      const json = await response.json();
      const data = (json?.data || []) as any[];
      const normalized: CartItem[] = data.map((item) => ({
        ...item,
        id: item.productId,
        productId: item.productId,
        cartItemId: item.id,
      }));
      setItems(normalized);
    } catch (err) {
      console.error("Failed to sync cart:", err);
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
      await syncCart();
    })();
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const addToCart = (product: Partial<CartItem>, size: string, color: string, quantity: number) => {
    if (!isAuthenticated) return;
    const token = getAuthToken();
    if (!token) return;
    setItems((currentItems) => {
      const existingItem = currentItems.find(
        (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
      );

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id && item.selectedSize === size && item.selectedColor === color
            ? { ...item, quantity: (item.quantity || 0) + quantity }
            : item
        );
      }

      return [
        ...currentItems,
        {
          id: product.id!,
          productId: Number(product.id),
          name: product.name || "",
          price: product.price || 0,
          label: product.label,
          productImage: product.productImage,
          mannequinImage: product.mannequinImage,
          colors: product.colors,
          quantity,
          selectedSize: size,
          selectedColor: color,
        },
      ];
    });

    fetch(`${API_BASE_URL}/cart/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: Number(product.id),
        quantity,
        selectedSize: size,
        selectedColor: color,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add to cart");
        return res.json();
      })
      .then(() => syncCart())
      .catch((err) => {
        console.error("Cart add failed:", err);
        syncCart();
      });
  };

  const removeFromCart = (productId: string | number, size: string, color: string) => {
    if (!isAuthenticated) return;
    const token = getAuthToken();
    if (!token) return;
    setItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );

    fetch(`${API_BASE_URL}/cart/items`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: Number(productId),
        selectedSize: size,
        selectedColor: color,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to remove from cart");
        return res.json().catch(() => null);
      })
      .then(() => syncCart())
      .catch((err) => {
        console.error("Cart remove failed:", err);
        syncCart();
      });
  };

  const updateQuantity = (productId: string | number, size: string, color: string, quantity: number) => {
    if (!isAuthenticated) return;
    const token = getAuthToken();
    if (!token) return;
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === productId && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity }
          : item
        )
    );

    fetch(`${API_BASE_URL}/cart/items`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        productId: Number(productId),
        quantity,
        selectedSize: size,
        selectedColor: color,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to update cart");
        return res.json();
      })
      .then(() => syncCart())
      .catch((err) => {
        console.error("Cart update failed:", err);
        syncCart();
      });
  };

  const clearCart = () => {
    if (!isAuthenticated) return;
    const token = getAuthToken();
    if (!token) return;
    setItems([]);
    fetch(`${API_BASE_URL}/cart`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to clear cart");
        return res.json().catch(() => null);
      })
      .then(() => syncCart())
      .catch((err) => {
        console.error("Cart clear failed:", err);
        syncCart();
      });
  };

  const visibleItems = isAuthenticated ? items : [];
  const total = visibleItems.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = visibleItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items: visibleItems, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}
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
