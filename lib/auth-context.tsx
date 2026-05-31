"use client";

import type { Session } from "@supabase/supabase-js";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  resolveUserRole,
  roleFromEmail,
  type UserRole,
} from "@/lib/auth/roles";
import { createClient } from "@/lib/supabase/client";

export type { UserRole };

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export type RegisterResult =
  | { needsEmailConfirmation: true }
  | { needsEmailConfirmation?: false };

export interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
  ) => Promise<RegisterResult>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function userFromSession(
  session: {
    user: {
      id: string;
      email?: string;
      user_metadata?: { full_name?: string; name?: string };
    };
  } | null,
): User | null {
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

async function enrichUserFromProfile(
  supabase: ReturnType<typeof createClient>,
  session: Session | null,
): Promise<User | null> {
  const base = userFromSession(session);
  if (!base) return null;
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", base.id)
    .maybeSingle();
  if (error) return base;
  // role es smallint: 0 = admin, cualquier otro = client
  const pr = profile?.role;
  const roleStr = pr === 0 ? "admin" : pr === 1 ? "client" : undefined;
  return {
    ...base,
    role: resolveUserRole(base.email, roleStr),
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
    let cancelled = false;
    void supabase.auth.getSession().then(async ({ data: { session } }) => {
      const u = await enrichUserFromProfile(supabase, session);
      if (!cancelled) {
        setUser(u);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" && typeof window !== "undefined") {
        const PROTECTED = [
          "/admin",
          "/mis-disenos",
          "/mis-pedidos",
          "/editor",
          "/guia",
          "/lineas",
          "/recursos",
          "/soporte",
        ];
        const onProtected = PROTECTED.some(
          (p) =>
            window.location.pathname === p ||
            window.location.pathname.startsWith(`${p}/`),
        );
        if (onProtected) {
          window.location.replace("/login");
          return;
        }
      }
      void enrichUserFromProfile(supabase, session).then((u) => {
        if (!cancelled) setUser(u);
      });
    });
    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
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
        const raw = error.message ?? "";
        const code = (error as { code?: string }).code ?? "";
        let msg: string;
        if (
          raw.includes("Database error querying schema") ||
          raw.includes("querying schema")
        ) {
          msg = `Error interno de base de datos (schema). Código: ${code || "db_schema"}. Contacta al administrador — el trigger handle_new_user puede estar roto o la tabla profiles tiene columnas incorrectas.`;
        } else if (
          raw.includes("Invalid login credentials") ||
          raw.includes("invalid_credentials")
        ) {
          msg = "Correo o contraseña incorrectos.";
        } else if (raw.includes("Email not confirmed")) {
          msg = "El correo aún no está confirmado.";
        } else if (raw.includes("Too many requests")) {
          msg = "Demasiados intentos. Espera unos minutos.";
        } else if (raw.includes("User not found")) {
          msg = "No existe una cuenta con ese correo.";
        } else {
          msg = `Error al iniciar sesión: ${raw} (${code || "sin código"})`;
        }
        throw new Error(msg);
      }
      const u = await enrichUserFromProfile(supabase, data.session);
      setUser(u);
      setIsLoading(false);
    },
    [supabase],
  );

  const register = useCallback(
    async (
      email: string,
      password: string,
      name: string,
    ): Promise<RegisterResult> => {
      setIsLoading(true);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name.trim() || undefined },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) {
        setIsLoading(false);
        throw new Error(error.message ?? "No se pudo crear la cuenta.");
      }
      if (data.session) {
        const u = await enrichUserFromProfile(supabase, data.session);
        setUser(u);
        setIsLoading(false);
        return { needsEmailConfirmation: false };
      }
      setIsLoading(false);
      setUser(null);
      return { needsEmailConfirmation: true };
    },
    [supabase],
  );

  const logout = useCallback(() => {
    supabase.auth.signOut();
    setUser(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, login, register, logout, isLoading }),
    [user, login, register, logout, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
