import { fetchWithAuth } from './api';

const BACKEND_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000';

export type InboundEmailSummary = {
  id: number;
  subject?: string | null;
  fromName?: string | null;
  fromEmail?: string | null;
  toEmails?: string[];
  ccEmails?: string[];
  protocol?: string | null;
  mailbox?: string | null;
  receivedAt?: string | null;
  createdAt?: string | null;
  preview?: string;
  archived?: boolean;
};

export type InboundEmailDetail = InboundEmailSummary & {
  messageId?: string | null;
  sourceId?: string | null;
  text?: string | null;
  html?: string | null;
  attachments?: Array<{
    filename?: string | null;
    contentType?: string | null;
    size?: number | null;
    contentId?: string | null;
    storagePath?: string | null;
    url?: string | null;
  }> | null;
};

export const inboundEmailApi = {
  async list(search = '', page = 1, pageSize = 20, includeArchived = false) {
    const url = `${BACKEND_URL}/admin/inbound-emails?search=${encodeURIComponent(search)}&page=${page}&pageSize=${pageSize}&includeArchived=${includeArchived}`;
    const res = await fetchWithAuth(url, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('Failed to fetch inbound emails');
    return res.json();
  },

  async get(id: number) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/inbound-emails/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to fetch inbound email');
    const json = await res.json();
    return json.data as InboundEmailDetail;
  },

  async archive(id: number, archived = true) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/inbound-emails/${id}/archive`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ archived }),
    });
    if (!res.ok) throw new Error('Failed to update inbound email');
    const json = await res.json();
    return json.data as InboundEmailDetail;
  },

  async remove(id: number) {
    const res = await fetchWithAuth(`${BACKEND_URL}/admin/inbound-emails/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Failed to delete inbound email');
  },
};
