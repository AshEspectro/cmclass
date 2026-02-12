// Public API helpers for the cmclass client
const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export const publicApi = {
  async getProducts(params?: {
    page?: number;
    pageSize?: number;
    categoryId?: number;
    search?: string;
  }) {
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.pageSize) searchParams.set('pageSize', String(params.pageSize));
      if (params?.categoryId) searchParams.set('categoryId', String(params.categoryId));
      if (params?.search) searchParams.set('search', params.search);

      const qs = searchParams.toString();
      const res = await fetch(
        `${BACKEND_URL}/products${qs ? `?${qs}` : ''}`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      if (!res.ok) throw new Error('Failed to fetch products');
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error('Error fetching products', err);
      return [];
    }
  },
  async getServices() {
    try {
      const res = await fetch(`${BACKEND_URL}/services`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to fetch services');
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.error('Error fetching services', err);
      return [];
    }
  },

  async getBrand() {
    try {
      const res = await fetch(`${BACKEND_URL}/brand`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to fetch brand');
      const json = await res.json();
      return json || {};
    } catch (err) {
      console.error('Error fetching brand', err);
      return {};
    }
  },

  async getProduct(id: number | string) {
    try {
      const res = await fetch(`${BACKEND_URL}/products/${id}`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to fetch product');
      const json = await res.json();
      return json.data || null;
    } catch (err) {
      console.error('Error fetching product', err);
      return null;
    }
  },

  async getCategories() {
    try {
      const res = await fetch(`${BACKEND_URL}/categories`, { headers: { 'Content-Type': 'application/json' } });
      if (!res.ok) throw new Error('Failed to fetch categories');
      const json = await res.json();
      return json; // returns { mainCategories, heroContent }
    } catch (err) {
      console.error('Error fetching categories', err);
      return { mainCategories: [], heroContent: {} };
    }
  }
};
