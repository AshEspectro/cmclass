// Hero section API service
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BACKEND_URL = (import.meta as any).env.VITE_BACKEND_URL || 'http://localhost:3000';

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
  // Get current hero section
  async getHero(): Promise<HeroData> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BACKEND_URL}/admin/hero`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hero section');
    }

    const result = await response.json();
    return result.data;
  },

  // Update hero section
  async updateHero(data: Partial<HeroData>): Promise<HeroData> {
    const token = localStorage.getItem('token');
    const response = await fetch(`${BACKEND_URL}/admin/hero`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
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
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BACKEND_URL}/admin/hero/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BACKEND_URL}/admin/hero/upload-video`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload video');
    }

    const result = await response.json();
    return result.url;
  },
};
