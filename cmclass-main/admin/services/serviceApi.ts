// Admin service API for managing services
const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

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
    const token = getToken();
    const res = await fetch(`${BACKEND_URL}/admin/services`, {
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch services');
    const json = await res.json();
    return json.data || [];
  },

  async createService(data: AdminService) {
    const token = getToken();
    const res = await fetch(`${BACKEND_URL}/admin/services`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create service');
    const json = await res.json();
    return json.data;
  },

  async updateService(id: number, data: Partial<AdminService>) {
    const token = getToken();
    const res = await fetch(`${BACKEND_URL}/admin/services/${id}`, {
      method: 'PATCH',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update service');
    const json = await res.json();
    return json.data;
  },

  async deleteService(id: number) {
    const token = getToken();
    const res = await fetch(`${BACKEND_URL}/admin/services/${id}`, {
      method: 'DELETE',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to delete service');
  },
};
