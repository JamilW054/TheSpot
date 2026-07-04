"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN = 60;

function VerificarContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const purpose = params.get("purpose") ?? "verify";
  const redirect = params.get("redirect") ?? "/";

  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  function handleDigitChange(idx: number, value: string) {
    const clean = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = clean;
    setDigits(next);
    setError(null);
    if (clean && idx < CODE_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    const next = Array(CODE_LENGTH).fill("");
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, CODE_LENGTH - 1)]?.focus();
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length < CODE_LENGTH) {
      setError("Ingresa el código completo de 6 dígitos.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/otp/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, purpose }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Código inválido.");
      } else {
        setSuccess(true);
        setTimeout(() => router.replace(redirect), 1500);
      }
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    try {
      await fetch("/api/auth/otp/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, purpose }),
      });
      setResendCooldown(RESEND_COOLDOWN);
      setDigits(Array(CODE_LENGTH).fill(""));
      setError(null);
      inputRefs.current[0]?.focus();
    } catch {
      setError("No se pudo reenviar el código.");
    }
  }

  if (!email) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mx-auto max-w-md w-full py-8 text-center">
          <p className="text-destructive text-sm">Enlace inválido. Falta el email.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      <div className="mx-auto max-w-md w-full py-8">

        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-2xl">
            🔐
          </div>
          <h1 className="mb-2 text-xl font-semibold text-foreground sm:text-2xl">
            Verificar email
          </h1>
          <p className="text-sm text-muted-foreground">
            Ingresa el código de 6 dígitos enviado a{" "}
            <strong className="text-foreground">{email}</strong>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          {/* Code inputs */}
          <div
            className="flex justify-center gap-2 sm:gap-3"
            onPaste={handlePaste}
          >
            {digits.map((d, i) => (
              <input
                // biome-ignore lint/suspicious/noArrayIndexKey: positional OTP inputs
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                autoFocus={i === 0}
                disabled={loading || success}
                className="h-14 w-12 rounded-lg border border-border bg-card text-center text-xl font-bold text-foreground outline-none ring-0 transition-all focus:border-primary focus:ring-2 focus:ring-primary/30 disabled:opacity-50 sm:w-14"
                aria-label={`Dígito ${i + 1}`}
              />
            ))}
          </div>

          {error && (
            <p role="alert" className="text-center text-sm text-destructive">
              {error}
            </p>
          )}

          {success && (
            <p role="status" className="text-center text-sm text-green-500">
              ✓ Código verificado. Redirigiendo…
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            disabled={loading || success}
          >
            {loading ? "Verificando…" : "Verificar código"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿No recibiste el código?{" "}
          {resendCooldown > 0 ? (
            <span className="text-muted-foreground/60">
              Reenviar en {resendCooldown}s
            </span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              className="font-medium text-primary hover:underline"
            >
              Reenviar código
            </button>
          )}
        </p>

      </div>
    </div>
  );
}

export default function VerificarPage() {
  return (
    <Suspense>
      <VerificarContent />
    </Suspense>
  );
}
