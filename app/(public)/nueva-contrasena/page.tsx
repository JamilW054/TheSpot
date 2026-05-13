"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
      } else {
        setDone(true);
        setTimeout(() => router.replace("/login"), 2500);
      }
    } catch {
      setError("Error inesperado. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mx-auto max-w-md w-full py-8 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-2xl">
            ✓
          </div>
          <h1 className="text-xl font-semibold text-foreground">Contraseña actualizada</h1>
          <p className="text-sm text-muted-foreground">Redirigiendo al inicio de sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="mx-auto max-w-md w-full py-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
            🔑
          </div>
          <h1 className="mb-2 text-xl font-semibold text-foreground sm:text-2xl">
            Nueva contraseña
          </h1>
          <p className="text-sm text-muted-foreground">
            Elige una contraseña segura para tu cuenta.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nueva contraseña"
            type="password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
            autoFocus
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="••••••••"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            disabled={loading}
            autoComplete="new-password"
          />
          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Guardando…" : "Guardar contraseña"}
          </Button>
        </form>
      </div>
    </div>
  );
}
