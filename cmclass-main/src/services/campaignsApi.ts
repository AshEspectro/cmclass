// Campaigns API service for client side
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

type RequestOptions = {
  throwOnError?: boolean;
};

export interface Campaign {
  id: number;
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

export const campaignsApi = {
  async getCampaigns(options: RequestOptions = {}): Promise<Campaign[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/campaigns`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        if (options.throwOnError) {
          throw new Error(`Failed to fetch campaigns: ${response.status}`);
        }
        console.error('Failed to fetch campaigns:', response.status);
        return [];
      }

      const result = await response.json();
      return result.data || [];
    } catch (error) {
      if (options.throwOnError) throw error;
      console.error('Error fetching campaigns:', error);
      return [];
    }
  },

  async getCampaignById(id: number): Promise<Campaign | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/campaigns/${id}`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error(`Failed to fetch campaign ${id}:`, response.status);
        return null;
      }

      const result = await response.json();
      return result.data || null;
    } catch (error) {
      console.error(`Error fetching campaign ${id}:`, error);
      return null;
    }
  },

  async getCampaignCatalog(id: number): Promise<{ products: any[]; campaign: Campaign } | null> {
    try {
      const response = await fetch(`${BACKEND_URL}/campaigns/${id}/catalog`, {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        console.error(`Failed to fetch campaign catalog ${id}:`, response.status);
        return null;
      }

      const result = await response.json();
      return result.data ? { products: result.data.products || [], campaign: result.data.campaign } : null;
    } catch (error) {
      console.error(`Error fetching campaign catalog ${id}:`, error);
      return null;
    }
  },
};
