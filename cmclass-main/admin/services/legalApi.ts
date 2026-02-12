const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface LegalContent {
    id?: number;
    type: string;
    title: string;
    content: string;
}

export const legalApi = {
    async getAll(): Promise<LegalContent[]> {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const res = await fetch(`${BACKEND_URL}/admin/legal`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error('Failed to fetch legal content');
        return res.json();
    },

    async getByType(type: string): Promise<LegalContent> {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const res = await fetch(`${BACKEND_URL}/admin/legal/${type}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) throw new Error(`Failed to fetch legal content for ${type}`);
        return res.json();
    },

    async update(payload: LegalContent): Promise<LegalContent> {
        const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
        const res = await fetch(`${BACKEND_URL}/admin/legal`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(error.message || 'Failed to update legal content');
        }
        return res.json();
    }
};
