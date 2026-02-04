// Category & Product API service for admin
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

function getToken(): string | null {
  let token = localStorage.getItem('token');
  if (token) return token;
  
  token = sessionStorage.getItem('token');
  if (token) return token;
  
  token = localStorage.getItem('access_token');
  if (token) return token;
  
  token = sessionStorage.getItem('access_token');
  if (token) return token;
  
  return null;
}

export const catalogApi = {
  async getCategories(): Promise<Category[]> {
    const token = getToken();
    const response = await fetch(`${BACKEND_URL}/admin/categories`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const result = await response.json();
    return result.data?.items || result.data || [];
  },

  async getProducts(): Promise<Product[]> {
    const token = getToken();
    const response = await fetch(`${BACKEND_URL}/admin/products`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const result = await response.json();
    return result.data?.items || result.data || [];
  },
};
