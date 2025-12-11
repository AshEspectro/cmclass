/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

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
  addToCart: (product: Partial<CartItem>, size: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string | number, size: string, color: string) => void;
  updateQuantity: (productId: string | number, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (product: Partial<CartItem>, size: string, color: string, quantity: number) => {
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
  };

  const removeFromCart = (productId: string | number, size: string, color: string) => {
    setItems((currentItems) =>
      currentItems.filter(
        (item) => !(item.id === productId && item.selectedSize === size && item.selectedColor === color)
      )
    );
  };

  const updateQuantity = (productId: string | number, size: string, color: string, quantity: number) => {
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
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}
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
