const API_BASE_URL =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    'http://localhost:3000';

export const authApi = {
    async login(credentials: any) {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        return response.json();
    },

    async register(data: any) {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Registration failed');
        }

        return response.json();
    },
    async oauthLogin(payload: { provider: 'google'; token: string; remember?: boolean }) {
        const response = await fetch(`${API_BASE_URL}/auth/oauth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'OAuth login failed');
        }

        return response.json();
    },

    async getMe(token: string) {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch user data');
        }

        return response.json();
    },

    async forgotPassword(email: string) {
        const response = await fetch(`${API_BASE_URL}/auth/forgot`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to send reset email');
        }

        return response.json();
    },
    async verifyEmail(token: string) {
        const response = await fetch(`${API_BASE_URL}/auth/verify?token=${encodeURIComponent(token)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Email verification failed');
        }

        return response.json();
    },
    async updateMe(token: string, data: any) {
        const response = await fetch(`${API_BASE_URL}/users/me`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }

        return response.json();
    },
};
