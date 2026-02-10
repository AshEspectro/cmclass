const BACKEND_URL = (import.meta as any).env.VITE_API_URL || "http://localhost:3000";

type LoginPayload = { email: string; password: string; remember?: boolean };
type RegisterPayload = {
  email: string;
  password: string;
  name?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  phoneCountryCode?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  marketingOptIn?: boolean;
  marketingEmails?: boolean;
  marketingSms?: boolean;
  marketingTargetedAds?: boolean;
};

const parseError = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.message || data?.error || "Request failed";
  } catch {
    return "Request failed";
  }
};

export const authApi = {
  async login(payload: LoginPayload) {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  async adminLogin(payload: LoginPayload) {
    const res = await fetch(`${BACKEND_URL}/auth/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  async register(payload: RegisterPayload) {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  async me(token: string) {
    const res = await fetch(`${BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },

  async logout(token: string) {
    const res = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });
    if (!res.ok) throw new Error(await parseError(res));
    return res.json();
  },
};
