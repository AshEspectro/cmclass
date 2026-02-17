// Category & Product API service for client side
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BACKEND_URL =
  (import.meta as any).env.VITE_BACKEND_URL ||
  (import.meta as any).env.VITE_API_URL ||
  'http://localhost:3000';

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  productImage?: string;
  priceCents: number;
  stock: number;
  status: string;
  inStock: boolean;
  categoryId: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  order: number;
}

export const catalogApi = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/products`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch products:', response.status);
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  async getCategories(): Promise<Category[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/categories`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error('Failed to fetch categories:', response.status);
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  },
};
