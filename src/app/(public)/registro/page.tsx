"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="mt-1 text-xs text-destructive">{msg}</p>;
}

interface FormErrors {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(fields: {
  fullName: string;
  username: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}): FormErrors {
  const errors: FormErrors = {};
  if (!fields.fullName.trim()) errors.fullName = "El nombre completo es obligatorio.";
  if (!fields.username.trim()) {
    errors.username = "El nombre de usuario es obligatorio.";
  } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(fields.username.trim())) {
    errors.username = "Solo letras, números y guión bajo. Entre 3 y 20 caracteres.";
  }
  if (!fields.email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())) {
    errors.email = "Ingresa un correo válido.";
  }
  if (fields.phone.trim() && !/^\+?[\d\s\-()]{7,}$/.test(fields.phone.trim())) {
    errors.phone = "Ingresa un teléfono válido.";
  }
  if (!fields.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (fields.password.length < 6) {
    errors.password = "Mínimo 6 caracteres.";
  }
  if (fields.confirmPassword && fields.password !== fields.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden.";
  }
  return errors;
}

export default function RegistroPage() {
  const router = useRouter();
  const { register, isLoading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const fields = {
      fullName: fullName.trim(),
      username: username.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      confirmPassword,
    };
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const result = await register(
        fields.email,
        fields.password,
        fields.fullName,
        fields.username,
        fields.phone || undefined,
      );
      if (result.needsEmailConfirmation) {
        setConfirmedEmail(fields.email);
      } else {
        router.replace("/cuenta");
      }
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "No se pudo crear la cuenta. Inténtalo de nuevo.",
      );
    }
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">

        <div className="mb-8 text-center">
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            Crear cuenta
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Únete a Buxxep y empieza a comprar
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="fullName">
              Nombre completo <span className="text-destructive">*</span>
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Ej. Juan Pérez"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
              className="h-11 w-full rounded-[10px] border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <FieldError msg={errors.fullName} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="username">
              Nombre de usuario <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">@</span>
              <input
                id="username"
                type="text"
                autoComplete="username"
                placeholder="tuusuario"
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
                disabled={isLoading}
                className="h-11 w-full rounded-[10px] border border-border bg-card pl-8 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
              />
            </div>
            <FieldError msg={errors.username} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="email">
              Correo electrónico <span className="text-destructive">*</span>
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
            <FieldError msg={errors.email} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="phone">
              Teléfono{" "}
              <span className="text-[11px] font-normal text-muted-foreground">(opcional)</span>
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="+1 809 000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={isLoading}
              className="h-11 w-full rounded-[10px] border border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-50"
            />
            <FieldError msg={errors.phone} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="password">
              Contraseña <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
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
            <FieldError msg={errors.password} />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="confirmPassword">
              Confirmar contraseña <span className="text-destructive">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isLoading}
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
            <FieldError msg={errors.confirmPassword} />
          </div>

          {submitError && (
            <p role="alert" className="rounded-[10px] bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {submitError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 h-12 w-full rounded-[10px] bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Creando cuenta…" : "Crear cuenta"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          ¿Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline underline-offset-2">
            Inicia sesión
          </Link>
        </p>
      </div>

      {confirmedEmail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm animate-scale-in">
          <div className="w-full max-w-sm rounded-[18px] border border-border bg-card p-8 text-center shadow-xl">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Mail className="size-8 text-primary" aria-hidden />
            </div>
            <h2 className="text-lg font-bold text-foreground">
              Correo de confirmación enviado
            </h2>
            <p className="mx-auto mt-3 max-w-[260px] text-sm text-muted-foreground leading-relaxed">
              Abre el enlace que te enviamos a{" "}
              <span className="font-medium text-foreground">{confirmedEmail}</span>{" "}
              para activar tu cuenta.
            </p>
            <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <CheckCircle className="size-3.5 text-green-500" aria-hidden />
              Revisa también tu carpeta de spam
            </div>
            <Link
              href="/login"
              className="mt-6 flex h-11 w-full items-center justify-center rounded-[10px] bg-primary text-sm font-bold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Ir a iniciar sesión
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
