"use client";

import { createClient } from "@/lib/supabase/client";
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

function roleFromEmail(email: string): UserRole {
  return email.toLowerCase().includes("admin") ? "admin" : "client";
}

function userFromSession(session: { user: { id: string; email?: string; user_metadata?: { full_name?: string; name?: string } } } | null): User | null {
  if (!session?.user?.email) return null;
  const name =
    session.user.user_metadata?.full_name ??
    session.user.user_metadata?.name ??
    session.user.email?.split("@")[0] ??
    "Usuario";
  return {
    id: session.user.id,
    email: session.user.email,
    name: typeof name === "string" ? name : "Usuario",
    role: roleFromEmail(session.user.email),
  };
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
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(userFromSession(session));
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(userFromSession(session));
    });
    return () => subscription.unsubscribe();
  }, [supabase]);

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setIsLoading(false);
        throw new Error(error.message ?? "No se pudo iniciar sesión.");
      }
      setUser(userFromSession(data.session));
      setIsLoading(false);
    },
    [supabase]
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() || undefined },
        },
      });
      if (error) {
        setIsLoading(false);
        throw new Error(error.message ?? "No se pudo crear la cuenta.");
      }
      setUser(userFromSession(data.session));
      setIsLoading(false);
    },
    [supabase]
  );

  const logout = useCallback(() => {
    supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, register, logout, isLoading }),
    [user, login, register, logout, isLoading]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}
