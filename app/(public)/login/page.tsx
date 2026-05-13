"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input, Button } from "@/components/ui";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      router.replace(safeRedirect ? redirectTo : "/mis-disenos");
    }
  }, [user, router, searchParams]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    if (!trimmedEmail || !trimmedPassword) {
      setError("Introduce email y contraseña.");
      return;
    }
    try {
      await login(trimmedEmail, trimmedPassword);
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
      setForgotError("Introduce tu email.");
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
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mx-auto max-w-md w-full py-8">

          {forgotSent ? (
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
                📬
              </div>
              <h1 className="text-xl font-semibold text-foreground">Revisa tu correo</h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <button
                type="button"
                onClick={exitForgot}
                className="mt-2 text-sm font-medium text-primary hover:underline"
              >
                ← Volver al inicio de sesión
              </button>
            </div>
          ) : (
            <>
              <button
                type="button"
                onClick={exitForgot}
                className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Volver
              </button>
              <h1 className="mb-2 text-xl font-semibold text-foreground sm:text-2xl">
                Olvidé mi contraseña
              </h1>
              <p className="text-muted-foreground text-sm mb-8">
                Ingresa tu email y te enviaremos un enlace para crear una nueva contraseña.
              </p>
              <form onSubmit={handleForgot} className="space-y-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="tu@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  disabled={forgotLoading}
                  autoComplete="email"
                  autoFocus
                />
                {forgotError && (
                  <p role="alert" className="text-sm text-destructive">
                    {forgotError}
                  </p>
                )}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={forgotLoading}
                >
                  {forgotLoading ? "Enviando…" : "Enviar enlace"}
                </Button>
              </form>
            </>
          )}

        </div>
      </div>
    );
  }

  // ── Normal login view ─────────────────────────────────────────────────────
  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="mx-auto max-w-md w-full py-8">
        <h1 className="mb-2 text-xl font-semibold text-foreground sm:text-2xl">
          Iniciar sesión
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Entra con tu email y contraseña.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            autoComplete="email"
          />
          <div className="space-y-1">
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              autoComplete="current-password"
            />
            <div className="flex justify-end">
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
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Iniciando sesión…" : "Iniciar sesión"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No tienes cuenta?{" "}
          <Link
            href="/registro"
            className="font-medium text-primary hover:underline"
          >
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
        <div className="flex flex-1 items-center justify-center text-muted-foreground">
          Cargando…
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
