// Category & Product API service for admin
import { fetchWithAuth } from './api';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  active: boolean;
  order: number;
}

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

export const catalogApi = {
  async getCategories(): Promise<Category[]> {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/categories`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const result = await response.json();
    return result.data?.items || result.data || [];
  },

  async getProducts(): Promise<Product[]> {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/products`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const result = await response.json();
    return result.data?.items || result.data || [];
  },
};
