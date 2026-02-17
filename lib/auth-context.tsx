"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
const SESSION_STORAGE_KEY = "buxxep_user";

function mockRoleFromEmail(email: string): UserRole {
  return email.toLowerCase().includes("admin") ? "admin" : "client";
}

function mockId(): string {
  return `user_${Math.random().toString(36).slice(2, 11)}`;
}

function loadUserFromStorage(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as User;
    if (data?.email && data?.name && data?.role) {
      return {
        id: data.id ?? mockId(),
        email: data.email,
        name: data.name,
        role: data.role === "admin" ? "admin" : "client",
      };
    }
  } catch {
    // ignore
  }
  return null;
}

function saveUserToStorage(user: User | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = loadUserFromStorage();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      const newUser: User = {
        id: mockId(),
        email,
        name: email.split("@")[0] ?? "Usuario",
        role: mockRoleFromEmail(email),
      };
      setUser(newUser);
      saveUserToStorage(newUser);
      setIsLoading(false);
    },
    []
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
      const newUser: User = {
        id: mockId(),
        email,
        name: (name.trim() || email.split("@")[0]) ?? "Usuario",
        role: mockRoleFromEmail(email),
      };
      setUser(newUser);
      saveUserToStorage(newUser);
      setIsLoading(false);
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    saveUserToStorage(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, register, logout, isLoading }),
    [user, login, register, logout, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
