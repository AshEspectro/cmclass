// Campaign API service
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

export const campaignApi = {
  async getCampaigns(): Promise<Campaign[]> {
    const token = getToken();
    const response = await fetch(`${BACKEND_URL}/admin/campaigns`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch campaigns');
    }

    const result = await response.json();
    return result.data || [];
  },

  async createCampaign(data: Campaign): Promise<Campaign> {
    const token = getToken();
    const response = await fetch(`${BACKEND_URL}/admin/campaigns`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create campaign');
    }

    const result = await response.json();
    return result.data;
  },

  async updateCampaign(id: number, data: Partial<Campaign>): Promise<Campaign> {
    const token = getToken();
    const response = await fetch(`${BACKEND_URL}/admin/campaigns/${id}`, {
      method: 'PATCH',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update campaign');
    }

    const result = await response.json();
    return result.data;
  },

  async deleteCampaign(id: number): Promise<void> {
    const token = getToken();
    const response = await fetch(`${BACKEND_URL}/admin/campaigns/${id}`, {
      method: 'DELETE',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Failed to delete campaign');
    }
  },
};
