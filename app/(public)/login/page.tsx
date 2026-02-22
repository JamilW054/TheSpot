"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input, Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, login, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(() => {
    const e = searchParams.get("error");
    return e ? decodeURIComponent(e) : null;
  });

  useEffect(() => {
    if (!user) return;
    if (user.role === "admin") {
      router.replace("/admin");
    } else {
      router.replace("/mis-disenos");
    }
  }, [user, router]);

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
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión. Inténtalo de nuevo.");
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="mx-auto max-w-md w-full py-8">
      <h1 className="text-2xl font-semibold text-foreground mb-2">
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
        <Input
          label="Contraseña"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          autoComplete="current-password"
        />
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
