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
import { checkAccountStatusOnLogin } from "@/lib/actions/account";
import { syncProfileEmail } from "@/lib/actions/profile";
import {
  ROLE_DB,
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
    username?: string,
    phone?: string,
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

/**
 * Crea la fila en `profiles` si aún no existe (1:1 con auth.users).
 * Sustituye al trigger de base de datos: el perfil se materializa en código la
 * primera vez que el usuario tiene sesión (registro con auto-confirm o primer
 * login tras confirmar el correo). `username` es NOT NULL, así que cae al local
 * del email si el metadata no trae uno; el `id` único evita duplicados.
 */
async function ensureProfile(
  supabase: ReturnType<typeof createClient>,
  session: Session,
): Promise<void> {
  const u = session.user;
  const meta = (u.user_metadata ?? {}) as {
    full_name?: string;
    name?: string;
    username?: string;
    phone?: string;
  };
  const username =
    meta.username?.trim() ||
    u.email?.split("@")[0]?.trim() ||
    `user_${u.id.slice(0, 8)}`;
  const fullName = (meta.full_name ?? meta.name)?.trim() || null;
  const phone = meta.phone?.trim() || null;

  await supabase.from("profiles").upsert(
    {
      id: u.id,
      username,
      full_name: fullName,
      phone,
      role: ROLE_DB.CLIENT,
    },
    { onConflict: "id", ignoreDuplicates: true },
  );
}

async function enrichUserFromProfile(
  supabase: ReturnType<typeof createClient>,
  session: Session | null,
): Promise<User | null> {
  const base = userFromSession(session);
  if (!base || !session) return base;
  let { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", base.id)
    .maybeSingle();
  // Si el perfil no existe aún, lo creamos y reintentamos la lectura.
  if (!error && !profile) {
    await ensureProfile(supabase, session);
    ({ data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", base.id)
      .maybeSingle());
  }
  if (error) return base;
  // role es smallint en `profiles`: ROLE_DB.ADMIN (0) = admin, resto = client.
  const pr = profile?.role;
  return {
    ...base,
    role: resolveUserRole(
      base.email,
      typeof pr === "string" || typeof pr === "number" ? pr : undefined,
    ),
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
          "/cuenta",
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

  // Refresco proactivo: el timer interno de Supabase se estrangula en pestañas
  // en segundo plano, así que al volver el foco/visibilidad/conexión revalidamos
  // la sesión. Si el access token expiró pero el refresh token sigue válido,
  // `getSession()` lo renueva (dispara TOKEN_REFRESHED) en vez de caer la sesión.
  useEffect(() => {
    let last = 0;
    const revalidate = () => {
      const now = Date.now();
      if (now - last < 5000) return; // throttle: evita ráfagas de foco
      last = now;
      void supabase.auth.getSession();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") revalidate();
    };
    window.addEventListener("focus", revalidate);
    window.addEventListener("online", revalidate);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", revalidate);
      window.removeEventListener("online", revalidate);
      document.removeEventListener("visibilitychange", onVisible);
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
      // Iniciar sesión dentro de los 30 días restaura la cuenta; si venció el
      // período de gracia, el servidor cierra la sesión y la bloqueamos aquí.
      const account = await checkAccountStatusOnLogin();
      if (account.status === "expired") {
        await supabase.auth.signOut();
        setUser(null);
        setIsLoading(false);
        throw new Error(account.message ?? "Esta cuenta fue eliminada.");
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
      username?: string,
      phone?: string,
    ): Promise<RegisterResult> => {
      setIsLoading(true);
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name.trim() || undefined,
            username: username?.trim() || undefined,
            phone: phone?.trim() || undefined,
          },
          emailRedirectTo: `${origin}/auth/callback`,
        },
      });
      if (error) {
        setIsLoading(false);
        throw new Error(error.message ?? "No se pudo crear la cuenta.");
      }
      // Guarda el correo en profiles (el perfil ya lo creó el trigger). El
      // user.id existe aunque falte confirmar el correo. Best-effort.
      if (data.user?.id) {
        void syncProfileEmail(data.user.id, email);
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
