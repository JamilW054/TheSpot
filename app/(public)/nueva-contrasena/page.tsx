"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LockKeyhole, CheckCircle, XCircle, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const RULES: { id: string; label: string; test: (p: string, c: string) => boolean }[] = [
  { id: "length", label: "Mínimo 8 caracteres", test: (p) => p.length >= 8 },
  { id: "match", label: "Las contraseñas coinciden", test: (p, c) => p.length > 0 && p === c },
];

function strengthScore(password: string): number {
  if (password.length === 0) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = ["", "Débil", "Regular", "Buena", "Fuerte"];
const STRENGTH_COLORS = ["bg-border", "bg-primary/25", "bg-primary/50", "bg-primary/75", "bg-primary"];
const STRENGTH_TEXT = ["text-muted-foreground/40", "text-primary/50", "text-primary/65", "text-primary/80", "text-primary"];

export default function NuevaContrasenaPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const score = strengthScore(password);
  const ruleResults = RULES.map((r) => r.test(password, confirm));
  const allRulesPassed = ruleResults.every(Boolean);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!allRulesPassed) {
      setError("Revisa los requisitos de la contraseña.");
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
      <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-scale-in rounded-[18px] border border-border bg-card p-10 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
            <CheckCircle className="size-8 text-green-500" aria-hidden />
          </div>
          <h1 className="text-lg font-bold text-foreground">Contraseña actualizada</h1>
          <p className="mt-2 text-sm text-muted-foreground">Redirigiendo al inicio de sesión…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[14px] border border-border bg-card">
            <LockKeyhole className="size-6 text-primary" aria-hidden />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Nueva contraseña
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Elige una contraseña segura para tu cuenta
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Nueva contraseña */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="password">
              Nueva contraseña <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                autoFocus
                placeholder="Mínimo 8 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
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

            {/* Barra de fuerza */}
            <div className="mt-2 space-y-1.5">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                      i <= score ? STRENGTH_COLORS[score] : "bg-border"
                    }`}
                  />
                ))}
              </div>
              <p className={`text-[11px] font-medium transition-colors duration-300 ${STRENGTH_TEXT[score]}`}>
                {STRENGTH_LABELS[score] || " "}
              </p>
            </div>
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="confirm">
              Confirmar contraseña <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="confirm"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={loading}
                className="h-11 w-full rounded-[10px] border border-border bg-card px-4 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirm((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          {/* Reglas */}
          <div className="rounded-[10px] border border-border bg-card px-4 py-3 space-y-2">
            {RULES.map((rule, i) => {
              const passed = ruleResults[i];
              return (
                <div key={rule.id} className="flex items-center gap-2">
                  {passed ? (
                    <CheckCircle className="size-3.5 shrink-0 text-green-500" aria-hidden />
                  ) : (
                    <XCircle className="size-3.5 shrink-0 text-muted-foreground/40" aria-hidden />
                  )}
                  <span className={`text-xs transition-colors ${passed ? "text-green-500" : "text-muted-foreground"}`}>
                    {rule.label}
                  </span>
                </div>
              );
            })}
          </div>
          {error && (
            <p role="alert" className="rounded-[10px] bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !allRulesPassed}
            className="mt-2 h-12 w-full rounded-[10px] bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "Guardando…" : (
              <span className="flex items-center justify-center gap-2">
                <Check className="size-4" aria-hidden />
                Guardar contraseña
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
