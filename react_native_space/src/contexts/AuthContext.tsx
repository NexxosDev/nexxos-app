import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginApi, signupApi, getMeApi } from '../services/auth';
import { getToken, setToken, removeToken } from '../services/token';
import { setOnUnauthorized } from '../services/api';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: Parameters<typeof signupApi>[0]) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(async () => {
    await removeToken();
    setUser(null);
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      clearAuth();
    });
  }, [clearAuth]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = await getToken();
        if (token) {
          const data = await getMeApi();
          if (mounted && data?.user) {
            setUser(data.user);
          }
        }
      } catch {
        await removeToken();
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await loginApi(email, password);
    if (data?.token) {
      await setToken(data.token);
    }
    setUser(data?.user ?? null);
  }, []);

  const signup = useCallback(async (signupData: Parameters<typeof signupApi>[0]) => {
    const data = await signupApi(signupData);
    if (data?.token) {
      await setToken(data.token);
    }
    setUser(data?.user ?? null);
  }, []);

  const logout = useCallback(async () => {
    await clearAuth();
  }, [clearAuth]);

  const refreshUser = useCallback(async () => {
    try {
      const data = await getMeApi();
      if (data?.user) setUser(data.user);
    } catch {
      await clearAuth();
    }
  }, [clearAuth]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}
