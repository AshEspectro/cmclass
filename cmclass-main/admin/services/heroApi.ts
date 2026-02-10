// Hero section API service
import { fetchWithAuth } from './api';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export interface HeroData {
  id?: number;
  mainText: string;
  subtext: string;
  backgroundImageUrl?: string;
  backgroundVideoUrl?: string;
  mediaType?: 'image' | 'video';
  ctaButtonText: string;
  ctaButtonUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const heroApi = {
  // Get current hero section (public endpoint)
  async getHero(): Promise<HeroData> {
    const response = await fetchWithAuth(`${BACKEND_URL}/hero`, {
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hero section');
    }

    const result = await response.json();
    return result;
  },

  // Update hero section
  async updateHero(data: Partial<HeroData>): Promise<HeroData> {
    const response = await fetchWithAuth(`${BACKEND_URL}/admin/hero`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update hero section');
    }

    const result = await response.json();
    return result.data;
  },

  // Upload hero background image
  async uploadBackgroundImage(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithAuth(`${BACKEND_URL}/admin/hero/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const result = await response.json();
    return result.url;
  },

  // Upload hero background video
  async uploadBackgroundVideo(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetchWithAuth(`${BACKEND_URL}/admin/hero/upload-video`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload video');
    }

    const result = await response.json();
    return result.url;
  },
};
