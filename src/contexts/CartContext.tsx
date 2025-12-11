import { createContext, useContext, useState, } from "react";
import type { ReactNode  } from "react";
import type { Product } from "../data/products";
import type { Product_cat } from "../data/products";

interface CartItem {
  id: number | string;
  name: string;
  price: number | string;
  label?: string;
  productImage?: string;
  mannequinImage?: string;
  colors?: { hex: string; images: string[] }[];
  quantity: number;
  selectedSize: string;
  selectedColor: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product | Product_cat, size: string, color: string, quantity: number) => void;
  removeFromCart: (productId: string | number, size: string, color: string) => void;
  updateQuantity: (productId: string | number, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (
  product: Product | Product_cat,
  size: string,
  color: string,
  quantity: number
) => {
  setItems((currentItems) => {
    const existingItem = currentItems.find(
      (item) => item.id === product.id && item.selectedSize === size && item.selectedColor === color
    );

    // Normalize colors
    let normalizedColors: { hex: string; images: string[] }[] | undefined = undefined;
    if ("colors" in product && product.colors) {
      if (typeof product.colors[0] === "string") {
        // Product.colors is string[]
        normalizedColors = (product.colors as string[]).map((c) => ({ hex: c, images: [] }));
      } else {
        // Product_cat.colors is already correct
        normalizedColors = product.colors as { hex: string; images: string[] }[];
      }
    }

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      label: "label" in product ? product.label : undefined,
      productImage: "productImage" in product ? product.productImage : undefined,
      mannequinImage: "mannequinImage" in product ? product.mannequinImage : undefined,
      colors: normalizedColors,
      quantity,
      selectedSize: size,
      selectedColor: color,
    };

    if (existingItem) {
      return currentItems.map((item) =>
        item.id === product.id && item.selectedSize === size && item.selectedColor === color
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    }

    return [...currentItems, cartItem];
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
