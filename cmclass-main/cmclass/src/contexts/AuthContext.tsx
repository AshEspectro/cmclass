/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authApi } from "../services/authApi";

interface User {
  id: number | string;
  email: string;
  username?: string;
  role?: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  register: (payload: {
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
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getStoredToken = () =>
  localStorage.getItem("access_token") || sessionStorage.getItem("access_token");

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const token = getStoredToken();
      if (!token) {
        setUser(null);
        setAccessToken(null);
        setLoading(false);
        return;
      }

      try {
        const me = await authApi.me(token);
        console.log("📡 [AuthContext] Bootstrap me response:", me);
        setUser(me.user); // Correct mapping: backend returns { user: rest }
        setAccessToken(token);
      } catch (e) {
        console.error("❌ [AuthContext] Bootstrap failed:", e);
        localStorage.removeItem("access_token");
        sessionStorage.removeItem("access_token");
        setUser(null);
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async (email: string, password: string, remember = true) => {
    const data = await authApi.login({ email, password, remember });
    const token = data.access_token;
    if (!token) throw new Error("Token manquant dans la réponse.");

    if (remember) {
      localStorage.setItem("access_token", token);
      sessionStorage.removeItem("access_token");
    } else {
      sessionStorage.setItem("access_token", token);
      localStorage.removeItem("access_token");
    }

    const me = await authApi.me(token);
    console.log("📡 [AuthContext] Login me response:", me);
    setUser(me.user); // Correct mapping
    setAccessToken(token);
  };

  const adminLogin = async (email: string, password: string) => {
    const data = await authApi.adminLogin({ email, password, remember: true });
    const token = data.access_token;
    if (!token) throw new Error("Token manquant dans la réponse.");

    // Admin token always stored in localStorage for now
    localStorage.setItem("access_token", token);
    sessionStorage.removeItem("access_token");

    const me = await authApi.me(token);
    console.log("📡 [AuthContext] Admin Login me response:", me);
    setUser(me.user); // Correct mapping
    setAccessToken(token);
  };

  const register = async (payload: {
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
  }) => {
    const data = await authApi.register(payload);
    const token = data.access_token;
    if (token) {
      localStorage.setItem("access_token", token);
      sessionStorage.removeItem("access_token");
      setAccessToken(token);
    }

    if (token) {
      const me = await authApi.me(token);
      console.log("📡 [AuthContext] Register me response:", me);
      setUser(me.user); // Correct mapping
    }
  };

  const logout = async () => {
    try {
      if (accessToken) {
        await authApi.logout(accessToken);
      }
    } catch {
      // ignore
    } finally {
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");
      setUser(null);
      setAccessToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        loading,
        login,
        adminLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
