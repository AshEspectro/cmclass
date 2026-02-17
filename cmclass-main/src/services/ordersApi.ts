const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

export interface CustomerOrderItem {
  id: number;
  productId: number;
  name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
  image?: string | null;
}

export interface CustomerOrder {
  id: number;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  createdAt: string;
  items: CustomerOrderItem[];
}

export const ordersApi = {
  async getMyOrders(token: string): Promise<CustomerOrder[]> {
    const response = await fetch(`${API_BASE_URL}/orders/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      let message = "Impossible de charger vos commandes.";
      try {
        const error = await response.json();
        message = error?.message || error?.error || message;
      } catch {
        // ignore json parse errors
      }
      throw new Error(message);
    }

    const json = await response.json();
    return Array.isArray(json?.data) ? json.data : [];
  },
};
