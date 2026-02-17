const BACKEND_URL =
  (import.meta as any).env.VITE_BACKEND_URL ||
  (import.meta as any).env.VITE_API_URL ||
  "http://localhost:3000";

export const getAccessToken = () =>
  localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

const parseError = async (res: Response) => {
  try {
    const data = await res.json();
    return data?.message || data?.error || "Request failed";
  } catch {
    return "Request failed";
  }
};

export const authFetch = async (path: string, options: RequestInit = {}) => {
  const token = getAccessToken();
  if (!token) throw new Error("AUTH_REQUIRED");

  const res = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(await parseError(res));
  }

  return res.json();
};
