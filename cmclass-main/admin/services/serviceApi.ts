// Admin service API for managing services
import { fetchWithAuth } from './api';
const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export interface AdminService {
  id?: number;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  order?: number;
  isActive?: boolean;
}

export const serviceApi = {
  async getServices(): Promise<AdminService[]> {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/services`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch services');
    const json = await res.json();
    return json.data || [];
  },

  async createService(data: AdminService) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/services`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create service');
    const json = await res.json();
    return json.data;
  },

  async updateService(id: number, data: Partial<AdminService>) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/services/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update service');
    const json = await res.json();
    return json.data;
  },

  async deleteService(id: number) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/services/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to delete service');
  },
};
