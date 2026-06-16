"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from "lucide-react";
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

  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const redirectTo = searchParams.get("redirect");
    const safeRedirect =
      redirectTo &&
      redirectTo.startsWith("/") &&
      !redirectTo.startsWith("//") &&
      redirectTo.length < 500;
    if (user.role === "admin") {
      router.replace(
        safeRedirect && redirectTo.startsWith("/admin") ? redirectTo : "/admin",
      );
    } else {
      router.replace(safeRedirect ? redirectTo : "/cuenta");
    }
  }, [user, router, searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError("Introduce email y contraseña.");
      return;
    }
    try {
      await login(trimmedEmail, password);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo iniciar sesión. Inténtalo de nuevo.",
      );
    }
  }

  async function handleForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setForgotError(null);
    const trimmed = forgotEmail.trim();
    if (!trimmed) {
      setForgotError("Introduce tu correo.");
      return;
    }
    setForgotLoading(true);
    try {
      await fetch("/api/auth/reset-password/solicitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      setForgotSent(true);
    } catch {
      setForgotError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setForgotLoading(false);
    }
  }

  function exitForgot() {
    setForgotMode(false);
    setForgotSent(false);
    setForgotEmail("");
    setForgotError(null);
  }

  // ── Forgot password view ──────────────────────────────────────────────────
  if (forgotMode) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-slide-up">

          {forgotSent ? (
            <div className="rounded-[18px] border border-border bg-card p-8 text-center">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="size-8 text-primary" aria-hidden />
              </div>
              <h1 className="text-lg font-bold text-foreground">Revisa tu correo</h1>
              <p className="mx-auto mt-3 max-w-65 text-sm text-muted-foreground leading-relaxed">
                Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña.
              </p>
              <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <CheckCircle className="size-3.5 text-green-500" aria-hidden />
                Revisa también tu carpeta de spam
              </div>
              <button
                type="button"
                onClick={exitForgot}
                className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-[10px] border border-border text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={exitForgot}
                className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="size-4" aria-hidden />
                Volver
              </button>
              <div className="mb-8 text-center">
                <h1 className="text-2xl font-black tracking-tight text-foreground">
                  Olvidé mi contraseña
                </h1>
                <p className="mt-1.5 text-sm text-muted-foreground">
                  Te enviaremos un enlace para crear una nueva contraseña.
                </p>
              </div>
              <form onSubmit={handleForgot} noValidate className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="forgotEmail">
                    Correo electrónico
                  </label>
                  <input
                    id="forgotEmail"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    placeholder="tu@correo.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    disabled={forgotLoading}
                    className="h-11 w-full rounded-[10px] border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
                  />
                  {forgotError && (
                    <p role="alert" className="mt-1 text-xs text-destructive">{forgotError}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="h-12 w-full rounded-[10px] bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {forgotLoading ? "Enviando…" : "Enviar enlace"}
                </button>
              </form>
            </>
          )}

        </div>
      </div>
    );
  }

  // ── Normal login view ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Iniciar sesión
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Entra con tu correo y contraseña
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="email">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="h-11 w-full rounded-[10px] border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-sm font-medium text-foreground" htmlFor="password">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotEmail(email.trim());
                  setForgotMode(true);
                }}
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
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
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-[10px] bg-destructive/10 px-4 py-3 text-sm text-destructive">
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
          ¿No tienes cuenta?{" "}
          <Link href="/registro" className="font-medium text-primary hover:underline underline-offset-2">
            Regístrate
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
