"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Input, Button } from "@/components/ui";

export default function RegistroPage() {
  const router = useRouter();
  const { user, register, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirm = passwordConfirm.trim();

    if (!trimmedName || !trimmedEmail || !trimmedPassword) {
      setError("Nombre, email y contraseña son obligatorios.");
      return;
    }
    if (trimmedConfirm && trimmedPassword !== trimmedConfirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const result = await register(trimmedEmail, trimmedPassword, trimmedName);
      if (result.needsEmailConfirmation) {
        setError(null);
        setSuccess(
          "Cuenta creada. Revisa tu correo para confirmar el email y luego inicia sesión.",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo crear la cuenta. Inténtalo de nuevo.",
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="mx-auto max-w-md w-full py-8">
        <h1 className="mb-2 text-xl font-semibold text-foreground sm:text-2xl">
          Crear cuenta
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Regístrate con tu nombre, email y contraseña.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            type="text"
            placeholder="Tu nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isLoading}
            autoComplete="name"
          />
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
            autoComplete="new-password"
          />
          <Input
            label="Repetir contraseña (opcional)"
            type="password"
            placeholder="••••••••"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            disabled={isLoading}
            autoComplete="new-password"
          />
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {success ? (
            <p
              role="status"
              className="text-sm text-green-600 dark:text-green-400"
            >
              {success}
            </p>
          ) : null}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Creando cuenta…" : "Registrarse"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
