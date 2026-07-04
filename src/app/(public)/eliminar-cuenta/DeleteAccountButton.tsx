"use client";

import { AlertTriangle, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAccountAction } from "@/lib/actions/account";
import { useAuth } from "@/lib/auth-context";

/**
 * Botón de eliminación de cuenta para usuarios autenticados en la web.
 * Marca `deleted_at = now()` en el servidor, cierra la sesión y redirige.
 * El borrado definitivo ocurre tras el período de gracia de 30 días.
 */
export function DeleteAccountButton() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="rounded-[14px] border border-border bg-card p-5 text-sm text-muted-foreground">
        <p>
          Para eliminar tu cuenta desde la web,{" "}
          <Link
            href="/login?redirect=/eliminar-cuenta"
            className="font-medium text-primary hover:underline underline-offset-2"
          >
            inicia sesión
          </Link>
          . También puedes hacerlo desde la app:{" "}
          <strong>Perfil &gt; Configuración &gt; Eliminar Cuenta</strong>.
        </p>
      </div>
    );
  }

  async function handleDelete() {
    setLoading(true);
    setError(null);
    const res = await deleteAccountAction();
    if (res.error) {
      setError(res.error);
      setLoading(false);
      return;
    }
    logout();
    router.replace("/?cuenta_eliminada=1");
  }

  return (
    <div className="rounded-[14px] border border-destructive/30 bg-destructive/5 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 size-5 shrink-0 text-destructive"
          aria-hidden
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            Eliminar mi cuenta
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sesión: <strong className="text-foreground">{user.email}</strong>.
            Se cerrará tu sesión y tu cuenta entrará en un período de
            recuperación de 30 días antes de la eliminación definitiva.
          </p>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-[10px] bg-destructive/10 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </p>
          )}

          {!confirming ? (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-[10px] border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
            >
              <Trash2 className="size-4" aria-hidden />
              Eliminar mi cuenta
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-[10px] bg-destructive px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="size-4" aria-hidden />
                {loading ? "Eliminando…" : "Sí, eliminar definitivamente"}
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={loading}
                className="rounded-[10px] border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/40 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
