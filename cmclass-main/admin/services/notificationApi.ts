import { fetchWithAuth } from './api';

const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export interface AdminNotification {
  id?: number;
  title: string;
  message: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
}

export const notificationApi = {
  async list(unreadOnly = false): Promise<AdminNotification[]> {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/notifications?unreadOnly=${unreadOnly}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch notifications');
    const json = await res.json();
    return json.data || [];
  },

  async create(data: AdminNotification) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/notifications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create notification');
    const json = await res.json();
    return json.data;
  },

  async markRead(id: number, read = true) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ read }),
    });
    if (!res.ok) throw new Error('Failed to update notification');
    const json = await res.json();
    return json.data;
  },

  async delete(id: number) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/notifications/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to delete notification');
  },
};
