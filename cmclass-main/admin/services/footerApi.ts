import { fetchWithAuth } from './api';

const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export interface FooterLink {
  id?: number;
  sectionId?: number;
  label: string;
  url: string;
  order?: number;
  isActive?: boolean;
}

export interface FooterSection {
  id?: number;
  title: string;
  order?: number;
  isActive?: boolean;
  links?: FooterLink[];
}

export const footerApi = {
  async listSections(): Promise<FooterSection[]> {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/footer/sections`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch footer sections');
    const json = await res.json();
    return json.data || [];
  },

  async createSection(data: FooterSection): Promise<FooterSection> {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/footer/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create footer section');
    const json = await res.json();
    return json.data;
  },

  async updateSection(id: number, data: Partial<FooterSection>): Promise<FooterSection> {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/footer/sections/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update footer section');
    const json = await res.json();
    return json.data;
  },

  async deleteSection(id: number) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/footer/sections/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to delete footer section');
  },

  async createLink(sectionId: number, data: FooterLink): Promise<FooterLink> {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/footer/sections/${sectionId}/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create footer link');
    const json = await res.json();
    return json.data;
  },

  async updateLink(id: number, data: Partial<FooterLink>): Promise<FooterLink> {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/footer/links/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update footer link');
    const json = await res.json();
    return json.data;
  },

  async deleteLink(id: number) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/footer/links/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to delete footer link');
  },
};
