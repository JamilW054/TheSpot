"use client";

import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { homePathForRole } from "@/lib/auth/roles";
import { useAuth } from "@/lib/auth-context";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(() => {
    const e = searchParams.get("error");
    return e ? decodeURIComponent(e) : null;
  });

  // Login compartido: admin → /admin, tiendas → /panel (respetando ?next=
  // solo si pertenece a la zona del rol).
  useEffect(() => {
    if (!user) return;
    const home = homePathForRole(user.role);
    const next = searchParams.get("next");
    const safeNext =
      next && home !== "/" && (next === home || next.startsWith(`${home}/`))
        ? next
        : home;
    router.replace(safeNext);
  }, [user, router, searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Introduce usuario y contraseña.");
      return;
    }
    try {
      // Usuario sin "@" (p. ej. "admin") → correo interno de Supabase Auth.
      const loginEmail = trimmedEmail.includes("@")
        ? trimmedEmail
        : `${trimmedEmail.toLowerCase()}@jwparfum.local`;
      await login(loginEmail, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <div className="mb-8 text-center">
          <p className="mb-3 text-2xl font-black tracking-tight">
            the<span className="text-primary"> spot</span>
            <span className="text-primary">.</span>
          </p>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Tiendas y administración
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-foreground"
              htmlFor="email"
            >
              Usuario o correo
            </label>
            <input
              id="email"
              type="text"
              autoComplete="username"
              placeholder="admin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-11 w-full rounded-[10px] border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <label
              className="mb-1.5 block text-sm font-medium text-foreground"
              htmlFor="password"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="h-11 w-full rounded-[10px] border border-border bg-card px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-[10px] bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-12 w-full rounded-[10px] bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Quieres vender en The Spot?{" "}
          <Link href="/vender/registro" className="font-semibold text-primary hover:underline">
            Registra tu tienda
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center text-muted-foreground text-sm">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
