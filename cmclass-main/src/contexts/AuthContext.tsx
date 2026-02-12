/* eslint-disable react-refresh/only-export-components */
// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { authApi } from "../services/authApi";

interface User {
  id: string;
  email: string;
  name?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (payload: any) => Promise<any>;
  oauthLogin: (payload: { provider: 'google'; token: string; remember?: boolean }) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const data = await authApi.getMe(token);
          setUser(data.user);
          setAccessToken(token);
        } catch (error) {
          console.error("Initial auth check failed:", error);
          localStorage.removeItem("auth_token");
          setAccessToken(null);
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials: any) => {
    try {
      const data = await authApi.login(credentials);
      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);
        setAccessToken(data.access_token);
        let resolvedUser = data.user;
        if (!resolvedUser) {
          try {
            const me = await authApi.getMe(data.access_token);
            resolvedUser = me?.user;
          } catch (meError) {
            console.error("Failed to load user profile:", meError);
          }
        }
        setUser(resolvedUser || null);
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (payload: any) => {
    try {
      const data = await authApi.register(payload);
      return data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const oauthLogin = async (payload: { provider: 'google'; token: string; remember?: boolean }) => {
    try {
      const data = await authApi.oauthLogin(payload);
      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);
        setAccessToken(data.access_token);
        let resolvedUser = data.user;
        if (!resolvedUser) {
          try {
            const me = await authApi.getMe(data.access_token);
            resolvedUser = me?.user;
          } catch (meError) {
            console.error("Failed to load user profile:", meError);
          }
        }
        setUser(resolvedUser || null);
      }
    } catch (error) {
      console.error("OAuth login failed:", error);
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      const data = await authApi.verifyEmail(token);
      if (data.access_token) {
        localStorage.setItem("auth_token", data.access_token);
        setAccessToken(data.access_token);
        let resolvedUser = data.user;
        if (!resolvedUser) {
          try {
            const me = await authApi.getMe(data.access_token);
            resolvedUser = me?.user;
          } catch (meError) {
            console.error("Failed to load user profile:", meError);
          }
        }
        setUser(resolvedUser || null);
      }
    } catch (error) {
      console.error("Email verification failed:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setAccessToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        const data = await authApi.getMe(token);
        setUser(data.user);
      } catch (error) {
        console.error("Failed to refresh user data:", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        oauthLogin,
        verifyEmail,
        logout,
        refreshUser,
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
