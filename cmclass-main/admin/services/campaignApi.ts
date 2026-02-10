// Campaign API service
import { fetchWithAuth } from './api';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export interface Campaign {
  id?: number;
  title: string;
  genreText?: string;
  imageUrl?: string;
  buttonText?: string;
  selectedCategories?: number[];
  selectedProductIds?: number[];
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export const campaignApi = {
  async getCampaigns(): Promise<Campaign[]> {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/campaigns`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch campaigns');
    }

    const result = await response.json();
    return result.data || [];
  },

  async createCampaign(data: Campaign): Promise<Campaign> {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create campaign');
    }

    const result = await response.json();
    return result.data;
  },

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign> {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/campaigns/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update campaign');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteCampaign(id: number): Promise<void> {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/campaigns/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to delete campaign');
    }
  },
};
