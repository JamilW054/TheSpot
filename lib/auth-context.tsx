"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type UserRole = "client" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const MOCK_DELAY_MS = 400;

function mockRoleFromEmail(email: string): UserRole {
  return email.toLowerCase().includes("admin") ? "admin" : "client";
}

function mockId(): string {
  return `user_${Math.random().toString(36).slice(2, 11)}`;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      setUser({
        id: mockId(),
        email,
        name: email.split("@")[0] ?? "Usuario",
        role: mockRoleFromEmail(email),
      });
      setIsLoading(false);
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      setUser({
        id: mockId(),
        email,
        name: name.trim() || email.split("@")[0] ?? "Usuario",
        role: mockRoleFromEmail(email),
      });
      setIsLoading(false);
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, register, logout, isLoading }),
    [user, login, register, logout, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
