// About page admin API service
import { fetchWithAuth } from './api';

const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export interface AboutValue {
  title: string;
  description: string;
}

export interface AboutData {
  id?: number;
  heroTitle: string;
  heroImageUrl?: string | null;
  visionTitle: string;
  visionParagraphs: string[];
  craftTitle: string;
  craftParagraphs: string[];
  craftImageUrl?: string | null;
  valuesTitle: string;
  values: AboutValue[];
  ctaTitle: string;
  ctaDescription?: string | null;
  ctaButtonText: string;
  ctaButtonUrl: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const aboutApi = {
  async getAbout(): Promise<AboutData> {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/about`, {
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch about content');
    const json = await res.json();
    return json.data || json;
  },

  async updateAbout(data: Partial<AboutData>): Promise<AboutData> {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/about`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update about content');
    const json = await res.json();
    return json.data || json;
  },
};
