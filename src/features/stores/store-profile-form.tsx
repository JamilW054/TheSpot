"use client";

import { Check, ImagePlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { citiesForProvince, DR_PROVINCES } from "@/config/dominican-republic";
import type { StoreProfileInput } from "@/lib/actions/stores";
import { STORE_BUSINESS_CATEGORIES } from "@/lib/stores/status";

/**
 * Formulario de datos de tienda. Tres usos:
 * - `register`: alta pública (cuenta + tienda + políticas).
 * - `resubmit`: el dueño corrige una solicitud rechazada.
 * - `profile`: perfil de una tienda aprobada (logo, portada, envío gratis).
 */

export type StoreFormMode = "register" | "resubmit" | "profile";

export interface StoreFormValues extends StoreProfileInput {
  password?: string;
  acceptPolicies?: boolean;
  freeShippingMinCents?: number | null;
}

export interface StoreProfileFormProps {
  mode: StoreFormMode;
  initial?: Partial<StoreFormValues>;
  submitLabel: string;
  onSubmit: (
    values: StoreFormValues & { website2?: string },
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  onDone?: () => void;
}

const inputCls =
  "h-11 w-full rounded-[10px] border border-border bg-card px-3.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60";
const labelCls = "mb-1.5 block text-sm font-medium text-foreground";

function Field({
  label,
  hint,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>
        {label}
      </label>
      {children}
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {description ? (
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  );
}

async function uploadImage(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("scope", "stores");
  const res = await fetch("/api/storage/r2/upload", {
    method: "POST",
    body: fd,
  });
  const body = (await res.json()) as {
    ok?: boolean;
    url?: string | null;
    error?: string;
  };
  if (!res.ok || !body.ok || !body.url)
    throw new Error(body.error ?? `Error ${res.status}`);
  return body.url;
}

function ImageField({
  id,
  label,
  value,
  onChange,
  aspect,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  aspect: "square" | "wide";
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div className={aspect === "wide" ? "sm:col-span-2" : ""}>
      <span className={labelCls}>{label}</span>
      <div className="flex items-center gap-3">
        <div
          className={`relative shrink-0 overflow-hidden rounded-xl border border-border bg-muted ${
            aspect === "wide" ? "h-20 w-48" : "size-20"
          }`}
        >
          {value ? (
            // biome-ignore lint/performance/noImgElement: vista previa de URL arbitraria
            <img src={value} alt="" className="size-full object-cover" />
          ) : (
            <ImagePlus
              className="absolute inset-0 m-auto size-6 text-muted-foreground"
              aria-hidden
            />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <label
            htmlFor={id}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm font-medium hover:bg-muted"
          >
            {busy ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <ImagePlus className="size-4" aria-hidden />
            )}
            Subir imagen
          </label>
          <input
            id={id}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="sr-only"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (!f) return;
              setBusy(true);
              setErr(null);
              try {
                onChange(await uploadImage(f));
              } catch (ex) {
                setErr(ex instanceof Error ? ex.message : "No se pudo subir.");
              } finally {
                setBusy(false);
              }
            }}
          />
          {value ? (
            <button
              type="button"
              onClick={() => onChange("")}
              className="ml-2 text-xs text-muted-foreground hover:text-destructive"
            >
              Quitar
            </button>
          ) : null}
          {err ? <p className="text-xs text-destructive">{err}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function StoreProfileForm({
  mode,
  initial,
  submitLabel,
  onSubmit,
  onDone,
}: StoreProfileFormProps) {
  const [v, setV] = useState<StoreFormValues>({
    name: initial?.name ?? "",
    tagline: initial?.tagline ?? "",
    description: initial?.description ?? "",
    businessType: initial?.businessType ?? "person",
    legalName: initial?.legalName ?? "",
    taxId: initial?.taxId ?? "",
    contactName: initial?.contactName ?? "",
    phone: initial?.phone ?? "",
    whatsapp: initial?.whatsapp ?? "",
    email: initial?.email ?? "",
    notificationEmail: initial?.notificationEmail ?? "",
    province: initial?.province ?? "",
    city: initial?.city ?? "",
    address: initial?.address ?? "",
    instagram: initial?.instagram ?? "",
    facebook: initial?.facebook ?? "",
    website: initial?.website ?? "",
    sellsCategories: initial?.sellsCategories ?? [],
    applicationNote: initial?.applicationNote ?? "",
    logoUrl: initial?.logoUrl ?? "",
    bannerUrl: initial?.bannerUrl ?? "",
    password: "",
    acceptPolicies: false,
    freeShippingMinCents: initial?.freeShippingMinCents ?? null,
  });
  const [freeShipping, setFreeShipping] = useState(
    initial?.freeShippingMinCents != null
      ? String(initial.freeShippingMinCents / 100)
      : "",
  );
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const cities = useMemo(() => citiesForProvince(v.province), [v.province]);

  const set = <K extends keyof StoreFormValues>(
    k: K,
    val: StoreFormValues[K],
  ) => {
    setSaved(false);
    setV((prev) => ({ ...prev, [k]: val }));
  };

  const toggleCategory = (c: string) =>
    set(
      "sellsCategories",
      v.sellsCategories.includes(c)
        ? v.sellsCategories.filter((x) => x !== c)
        : [...v.sellsCategories, c],
    );

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const pesos = Number.parseFloat(freeShipping.replace(",", "."));
        start(async () => {
          const res = await onSubmit({
            ...v,
            freeShippingMinCents:
              freeShipping.trim() && !Number.isNaN(pesos)
                ? Math.round(pesos * 100)
                : null,
            website2: honeypot,
          });
          if (!res.ok) {
            setError(res.error);
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }
          setSaved(true);
          onDone?.();
        });
      }}
    >
      {error ? (
        <p
          role="alert"
          className="rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      {/* Honeypot anti-bots: invisible para personas. */}
      <div
        aria-hidden
        className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
      >
        <label htmlFor="website2">No llenar</label>
        <input
          id="website2"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <Section
        title="Tu tienda"
        description="Así te verán los clientes en The Spot."
      >
        <Field
          label="Nombre de la tienda"
          htmlFor="name"
          hint={
            mode === "profile"
              ? "Para cambiar el nombre escríbenos."
              : undefined
          }
        >
          <input
            id="name"
            className={inputCls}
            value={v.name}
            disabled={mode === "profile"}
            maxLength={80}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ej. Moda Bella RD"
          />
        </Field>
        <Field label="Frase corta (opcional)" htmlFor="tagline">
          <input
            id="tagline"
            className={inputCls}
            value={v.tagline ?? ""}
            maxLength={120}
            onChange={(e) => set("tagline", e.target.value)}
            placeholder="Ej. Ropa de mujer a buen precio"
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Descripción" htmlFor="description">
            <textarea
              id="description"
              rows={3}
              maxLength={2000}
              className={`${inputCls} h-auto py-2.5`}
              value={v.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Qué vendes, desde cuándo, qué te hace diferente…"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <span className={labelCls}>¿Qué vendes?</span>
          <div className="flex flex-wrap gap-2">
            {STORE_BUSINESS_CATEGORIES.map((c) => {
              const on = v.sellsCategories.includes(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleCategory(c)}
                  aria-pressed={on}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                    on
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-border hover:bg-muted"
                  }`}
                >
                  {on ? <Check className="size-3.5" aria-hidden /> : null}
                  {c}
                </button>
              );
            })}
          </div>
        </div>
        {mode === "profile" ? (
          <>
            <ImageField
              id="logo"
              label="Logo"
              value={v.logoUrl ?? ""}
              onChange={(x) => set("logoUrl", x)}
              aspect="square"
            />
            <ImageField
              id="banner"
              label="Portada"
              value={v.bannerUrl ?? ""}
              onChange={(x) => set("bannerUrl", x)}
              aspect="wide"
            />
          </>
        ) : null}
      </Section>

      <Section
        title="Datos del negocio"
        description="Solo los ve el equipo de The Spot para verificar tu tienda."
      >
        <Field label="Tipo" htmlFor="businessType">
          <select
            id="businessType"
            className={inputCls}
            value={v.businessType}
            onChange={(e) =>
              set(
                "businessType",
                e.target.value === "company" ? "company" : "person",
              )
            }
          >
            <option value="person">Persona física</option>
            <option value="company">Empresa</option>
          </select>
        </Field>
        <Field
          label={v.businessType === "company" ? "RNC" : "Cédula (opcional)"}
          htmlFor="taxId"
        >
          <input
            id="taxId"
            inputMode="numeric"
            className={inputCls}
            value={v.taxId ?? ""}
            onChange={(e) => set("taxId", e.target.value)}
          />
        </Field>
        {v.businessType === "company" ? (
          <div className="sm:col-span-2">
            <Field label="Razón social" htmlFor="legalName">
              <input
                id="legalName"
                className={inputCls}
                value={v.legalName ?? ""}
                onChange={(e) => set("legalName", e.target.value)}
              />
            </Field>
          </div>
        ) : null}
        <Field label="Persona de contacto" htmlFor="contactName">
          <input
            id="contactName"
            autoComplete="name"
            className={inputCls}
            value={v.contactName}
            onChange={(e) => set("contactName", e.target.value)}
          />
        </Field>
        <Field label="Teléfono" htmlFor="phone">
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            className={inputCls}
            value={v.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="809 000 0000"
          />
        </Field>
        <Field
          label="WhatsApp para pedidos"
          htmlFor="whatsapp"
          hint="Los clientes te escribirán aquí. Si lo dejas vacío usamos el teléfono."
        >
          <input
            id="whatsapp"
            type="tel"
            className={inputCls}
            value={v.whatsapp ?? ""}
            onChange={(e) => set("whatsapp", e.target.value)}
          />
        </Field>
        <Field
          label={
            mode === "register"
              ? "Correo (con él inicias sesión)"
              : "Correo de contacto"
          }
          htmlFor="email"
        >
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputCls}
            value={v.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </Field>
        <Field
          label="Correo para avisos de pedidos (opcional)"
          htmlFor="notificationEmail"
        >
          <input
            id="notificationEmail"
            type="email"
            className={inputCls}
            value={v.notificationEmail ?? ""}
            onChange={(e) => set("notificationEmail", e.target.value)}
          />
        </Field>
        <Field label="Provincia" htmlFor="province">
          <select
            id="province"
            className={inputCls}
            value={v.province}
            onChange={(e) => {
              set("province", e.target.value);
              set("city", "");
            }}
          >
            <option value="">Elige…</option>
            {DR_PROVINCES.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Ciudad / municipio" htmlFor="city">
          <input
            id="city"
            list="store-cities"
            className={inputCls}
            value={v.city ?? ""}
            onChange={(e) => set("city", e.target.value)}
          />
          <datalist id="store-cities">
            {cities.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Dirección (opcional)" htmlFor="address">
            <input
              id="address"
              autoComplete="street-address"
              className={inputCls}
              value={v.address ?? ""}
              onChange={(e) => set("address", e.target.value)}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Redes (opcional)"
        description="Nos ayudan a verificar tu negocio más rápido."
      >
        <Field label="Instagram" htmlFor="instagram">
          <input
            id="instagram"
            className={inputCls}
            value={v.instagram ?? ""}
            onChange={(e) => set("instagram", e.target.value)}
            placeholder="@mitienda"
          />
        </Field>
        <Field label="Facebook" htmlFor="facebook">
          <input
            id="facebook"
            className={inputCls}
            value={v.facebook ?? ""}
            onChange={(e) => set("facebook", e.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Sitio web" htmlFor="website">
            <input
              id="website"
              type="url"
              className={inputCls}
              value={v.website ?? ""}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://"
            />
          </Field>
        </div>
        {mode !== "profile" ? (
          <div className="sm:col-span-2">
            <Field
              label="¿Algo más que debamos saber? (opcional)"
              htmlFor="applicationNote"
            >
              <textarea
                id="applicationNote"
                rows={3}
                maxLength={1500}
                className={`${inputCls} h-auto py-2.5`}
                value={v.applicationNote ?? ""}
                onChange={(e) => set("applicationNote", e.target.value)}
              />
            </Field>
          </div>
        ) : null}
      </Section>

      {mode === "profile" ? (
        <Section title="Envíos">
          <Field
            label="Envío gratis desde (RD$)"
            htmlFor="freeShipping"
            hint="Vacío o 0 = siempre se cobra el envío."
          >
            <input
              id="freeShipping"
              type="number"
              min={0}
              className={inputCls}
              value={freeShipping}
              onChange={(e) => setFreeShipping(e.target.value)}
            />
          </Field>
        </Section>
      ) : null}

      {mode === "register" ? (
        <Section title="Tu cuenta">
          <Field
            label="Contraseña"
            htmlFor="password"
            hint="Mínimo 8 caracteres."
          >
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              value={v.password ?? ""}
              onChange={(e) => set("password", e.target.value)}
            />
          </Field>
          <div className="flex items-start gap-3 sm:col-span-2">
            <input
              id="acceptPolicies"
              type="checkbox"
              className="mt-1 size-4 accent-primary"
              checked={Boolean(v.acceptPolicies)}
              onChange={(e) => set("acceptPolicies", e.target.checked)}
            />
            <label
              htmlFor="acceptPolicies"
              className="text-sm text-muted-foreground"
            >
              Acepto las{" "}
              <Link
                href="/vender/politicas"
                target="_blank"
                className="font-medium text-primary hover:underline"
              >
                políticas para vendedores
              </Link>
              . Entiendo que no se permite contenido sexual, productos
              prohibidos ni falsificaciones, y que The Spot puede rechazar o
              suspender mi tienda.
            </label>
          </div>
        </Section>
      ) : null}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-8 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          {submitLabel}
        </button>
        {saved && mode === "profile" ? (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-600">
            <Check className="size-4" aria-hidden /> Guardado
          </span>
        ) : null}
      </div>
    </form>
  );
}
